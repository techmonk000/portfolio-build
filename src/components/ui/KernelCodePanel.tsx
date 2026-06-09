"use client";
import { useEffect, useRef, useState } from "react";

const CODE = `#include <cuda_runtime.h>
#include <cuda_fp16.h>
#include <cublas_v2.h>
#include <cstddef>

namespace nebion {

constexpr int BM = 64;
constexpr int BN = 64;
constexpr int BK = 16;
constexpr int TM = 4;
constexpr int TN = 4;

static_assert(BM % TM == 0, "BM must be divisible by TM");
static_assert(BN % TN == 0, "BN must be divisible by TN");
static_assert((BM / TM) * (BN / TN) == 256, "block must have 256 threads");

__global__ void gemm_f16_kernel(
    const int M, const int N, const int K,
    const float alpha,
    const __half* __restrict__ A,
    const __half* __restrict__ B,
    const float beta,
    __half*       __restrict__ C)
{
    const int block_row = blockIdx.y * BM;
    const int block_col = blockIdx.x * BN;

    const int tx = threadIdx.x;
    const int ty = threadIdx.y;

    const int row = block_row + ty * TM;
    const int col = block_col + tx * TN;

    float c_reg[TM][TN] = {{0.0f}};

    __shared__ __half A_tile[BM][BK];
    __shared__ __half B_tile[BK][BN];

    const int tid = ty * (BN / TN) + tx;

    for (int k0 = 0; k0 < K; k0 += BK) {
        #pragma unroll
        for (int i = 0; i < 4; i++) {
            const int linear = tid * 4 + i;
            const int tile_r = linear / BK;
            const int tile_c = linear % BK;
            const int g_r = block_row + tile_r;
            const int g_c = k0 + tile_c;
            A_tile[tile_r][tile_c] =
                (g_r < M && g_c < K) ? A[g_r * K + g_c] : __float2half(0.0f);
        }

        #pragma unroll
        for (int i = 0; i < 4; i++) {
            const int linear = tid * 4 + i;
            const int tile_r = linear / BN;
            const int tile_c = linear % BN;
            const int g_r = k0 + tile_r;
            const int g_c = block_col + tile_c;
            B_tile[tile_r][tile_c] =
                (g_r < K && g_c < N) ? B[g_r * N + g_c] : __float2half(0.0f);
        }

        __syncthreads();

        #pragma unroll
        for (int kk = 0; kk < BK; kk++) {
            __half a_col[TM];
            __half b_row[TN];

            #pragma unroll
            for (int i = 0; i < TM; i++) {
                a_col[i] = A_tile[ty * TM + i][kk];
            }
            #pragma unroll
            for (int j = 0; j < TN; j++) {
                b_row[j] = B_tile[kk][tx * TN + j];
            }
            #pragma unroll
            for (int i = 0; i < TM; i++) {
                const float a_f = __half2float(a_col[i]);
                #pragma unroll
                for (int j = 0; j < TN; j++) {
                    c_reg[i][j] += a_f * __half2float(b_row[j]);
                }
            }
        }

        __syncthreads();
    }

    #pragma unroll
    for (int i = 0; i < TM; i++) {
        const int g_r = row + i;
        if (g_r >= M) continue;
        #pragma unroll
        for (int j = 0; j < TN; j++) {
            const int g_c = col + j;
            if (g_c >= N) continue;
            const float prev = (beta == 0.0f) ? 0.0f : __half2float(C[g_r * N + g_c]) * beta;
            const float out  = alpha * c_reg[i][j] + prev;
            C[g_r * N + g_c] = __float2half(out);
        }
    }
}

}  // namespace nebion

extern "C" {

int nebion_gemm_f16(
    int M, int N, int K,
    float alpha,
    const void* A,
    const void* B,
    float beta,
    void* C)
{
    if (M <= 0 || N <= 0 || K <= 0) return 0;
    if (A == nullptr || B == nullptr || C == nullptr) {
        return static_cast<int>(cudaErrorInvalidValue);
    }
    if (M % nebion::BM != 0 || N % nebion::BN != 0) {
        return static_cast<int>(cudaErrorInvalidValue);
    }

    dim3 block(nebion::BN / nebion::TN, nebion::BM / nebion::TM);
    dim3 grid(N / nebion::BN, M / nebion::BM);

    nebion::gemm_f16_kernel<<<grid, block>>>(
        M, N, K, alpha,
        static_cast<const __half*>(A),
        static_cast<const __half*>(B),
        beta,
        static_cast<__half*>(C)
    );

    cudaError_t err = cudaGetLastError();
    return static_cast<int>(err);
}

static cublasHandle_t g_cublas_handle = nullptr;

static cublasStatus_t ensure_handle()
{
    if (g_cublas_handle == nullptr) {
        return cublasCreate(&g_cublas_handle);
    }
    return CUBLAS_STATUS_SUCCESS;
}

static int run_cublas_hgemm(
    int M, int N, int K,
    float alpha_f,
    const void* A,
    const void* B,
    float beta_f,
    void* C,
    cublasGemmAlgo_t algo)
{
    if (ensure_handle() != CUBLAS_STATUS_SUCCESS) return -1;

    const float alpha = alpha_f;
    const float beta  = beta_f;

    cublasStatus_t status = cublasGemmEx(
        g_cublas_handle,
        CUBLAS_OP_N, CUBLAS_OP_N,
        N, M, K,
        &alpha,
        B, CUDA_R_16F, N,
        A, CUDA_R_16F, K,
        &beta,
        C, CUDA_R_16F, N,
        CUBLAS_COMPUTE_32F,
        algo
    );

    if (status != CUBLAS_STATUS_SUCCESS) {
        return static_cast<int>(status);
    }

    cudaError_t err = cudaGetLastError();
    return static_cast<int>(err);
}

int nebion_cublas_hgemm_tc(
    int M, int N, int K,
    float alpha_f,
    const void* A,
    const void* B,
    float beta_f,
    void* C)
{
    if (ensure_handle() != CUBLAS_STATUS_SUCCESS) return -1;

    cublasSetMathMode(g_cublas_handle, CUBLAS_DEFAULT_MATH);

    const float alpha = alpha_f;
    const float beta  = beta_f;

    cublasStatus_t status = cublasGemmEx(
        g_cublas_handle,
        CUBLAS_OP_N, CUBLAS_OP_N,
        N, M, K,
        &alpha,
        B, CUDA_R_16F, N,
        A, CUDA_R_16F, K,
        &beta,
        C, CUDA_R_16F, N,
        CUBLAS_COMPUTE_32F_FAST_16F,
        CUBLAS_GEMM_DEFAULT_TENSOR_OP
    );
    if (status != CUBLAS_STATUS_SUCCESS) return static_cast<int>(status);

    cudaError_t err = cudaGetLastError();
    return static_cast<int>(err);
}

int nebion_cublas_hgemm_cuda_cores(
    int M, int N, int K,
    float alpha_f,
    const void* A,
    const void* B,
    float beta_f,
    void* C)
{
    if (ensure_handle() != CUBLAS_STATUS_SUCCESS) return -1;

    cublasSetMathMode(g_cublas_handle, CUBLAS_PEDANTIC_MATH);

    const float alpha = alpha_f;
    const float beta  = beta_f;

    cublasStatus_t status = cublasGemmEx(
        g_cublas_handle,
        CUBLAS_OP_N, CUBLAS_OP_N,
        N, M, K,
        &alpha,
        B, CUDA_R_16F, N,
        A, CUDA_R_16F, K,
        &beta,
        C, CUDA_R_16F, N,
        CUBLAS_COMPUTE_32F,
        CUBLAS_GEMM_DEFAULT
    );

    cublasSetMathMode(g_cublas_handle, CUBLAS_DEFAULT_MATH);

    if (status != CUBLAS_STATUS_SUCCESS) return static_cast<int>(status);
    cudaError_t err = cudaGetLastError();
    return static_cast<int>(err);
}

}  // extern "C"`;

type Token = { text: string; color: string };
type Line = Token[];

function tokenize(code: string): Line[] {
  const KEYWORDS = /\b(namespace|constexpr|int|float|const|static|void|return|for|if|extern|__global__|__shared__|__half|__restrict__|dim3|static_assert|nullptr|true|false|__half2float|__float2half|cublasStatus_t|cublasHandle_t|cudaError_t|cublasGemmAlgo_t|cublasSetMathMode|cublasCreate|cublasGemmEx|cudaGetLastError|pragma)\b/g;
  const TYPES = /\b(cudaErrorInvalidValue|CUBLAS_STATUS_SUCCESS|CUBLAS_OP_N|CUBLAS_COMPUTE_32F|CUBLAS_COMPUTE_32F_FAST_16F|CUBLAS_GEMM_DEFAULT|CUBLAS_GEMM_DEFAULT_TENSOR_OP|CUBLAS_DEFAULT_MATH|CUBLAS_PEDANTIC_MATH|CUDA_R_16F|BM|BN|BK|TM|TN)\b/g;
  const NUMBERS = /\b(\d+\.?\d*f?)\b/g;
  const STRINGS = /"([^"]*)"/g;
  const PREPROCESSOR = /^(#\w+.*)/gm;
  const OPERATORS = /([<>{}[\]()=+\-*\/&|!,;:.?])/g;

  const cyan = "#00D4FF";
  const magenta = "#FF2D78";
  const green = "#39FF14";
  const orange = "#FF6B35";
  const purple = "#AA88FF";
  const white = "#E2E8F0";
  const dim = "#64748B";

  return code.split("\n").map((line) => {
    const tokens: Token[] = [];
    let i = 0;

    while (i < line.length) {
      let matched = false;

      // preprocessor line
      if (i === 0 && line.startsWith("#")) {
        tokens.push({ text: line, color: purple });
        i = line.length;
        matched = true;
        break;
      }

      // keyword
      const kwMatch = line.slice(i).match(/^(__global__|__shared__|__half\b|__restrict__|__half2float|__float2half|namespace|constexpr|static_assert|extern|pragma|unroll)\b/);
      if (kwMatch) {
        tokens.push({ text: kwMatch[0], color: magenta });
        i += kwMatch[0].length;
        matched = true;
        continue;
      }

      const kwMatch2 = line.slice(i).match(/^(int|float|const|static|void|return|for|if|nullptr|true|false|dim3)\b/);
      if (kwMatch2) {
        tokens.push({ text: kwMatch2[0], color: cyan });
        i += kwMatch2[0].length;
        matched = true;
        continue;
      }

      // CUDA types / constants
      const typeMatch = line.slice(i).match(/^(cudaError_t|cublasStatus_t|cublasHandle_t|cublasGemmAlgo_t|CUBLAS_STATUS_SUCCESS|CUBLAS_OP_N|CUBLAS_COMPUTE_32F_FAST_16F|CUBLAS_COMPUTE_32F|CUBLAS_GEMM_DEFAULT_TENSOR_OP|CUBLAS_GEMM_DEFAULT|CUBLAS_DEFAULT_MATH|CUBLAS_PEDANTIC_MATH|CUDA_R_16F|cudaErrorInvalidValue)\b/);
      if (typeMatch) {
        tokens.push({ text: typeMatch[0], color: orange });
        i += typeMatch[0].length;
        matched = true;
        continue;
      }

      // tile constants
      const constMatch = line.slice(i).match(/^(BM|BN|BK|TM|TN)\b/);
      if (constMatch) {
        tokens.push({ text: constMatch[0], color: green });
        i += constMatch[0].length;
        matched = true;
        continue;
      }

      // function calls
      const fnMatch = line.slice(i).match(/^([a-zA-Z_]\w*)\s*(?=\()/);
      if (fnMatch) {
        tokens.push({ text: fnMatch[1], color: "#7DD3FC" });
        i += fnMatch[1].length;
        matched = true;
        continue;
      }

      // numbers
      const numMatch = line.slice(i).match(/^(\d+\.?\d*f?)\b/);
      if (numMatch) {
        tokens.push({ text: numMatch[0], color: "#F9A8D4" });
        i += numMatch[0].length;
        matched = true;
        continue;
      }

      // string literal
      if (line[i] === '"') {
        const end = line.indexOf('"', i + 1);
        if (end !== -1) {
          tokens.push({ text: line.slice(i, end + 1), color: "#86EFAC" });
          i = end + 1;
          matched = true;
          continue;
        }
      }

      // angle bracket template / generic fallthrough
      tokens.push({ text: line[i], color: /[{}()\[\]<>=+\-*\/&|!,;:.?@]/.test(line[i]) ? dim : white });
      i++;
    }

    return tokens;
  });
}

export default function KernelCodePanel({ className = "" }: { className?: string }) {
  const [lines] = useState<Line[]>(() => tokenize(CODE));
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* IDE title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0D1117] border-b border-[#1A2A3A] shrink-0">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <span className="font-mono text-xs text-white/40 ml-2">gemm_fp16.cu</span>
        <span className="ml-auto font-mono text-xs text-[#00D4FF]/50">nebion / crates / nebion-cuda</span>
      </div>

      {/* Code area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-auto"
        style={{
          background: "#0D1117",
          scrollbarWidth: "thin",
          scrollbarColor: "#1A2A3A #0D1117",
        }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-[#00D4FF]/5 transition-colors group">
                <td
                  className="select-none text-right pr-4 pl-4 font-mono text-xs text-[#3A4A5A] group-hover:text-[#00D4FF]/40 w-10 shrink-0"
                  style={{ userSelect: "none", verticalAlign: "top", paddingTop: "1px", paddingBottom: "1px" }}
                >
                  {idx + 1}
                </td>
                <td className="pr-6 font-mono text-xs whitespace-pre" style={{ paddingTop: "1px", paddingBottom: "1px" }}>
                  {line.length === 0 ? (
                    <span>&nbsp;</span>
                  ) : (
                    line.map((tok, ti) => (
                      <span key={ti} style={{ color: tok.color }}>
                        {tok.text}
                      </span>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-1 bg-[#0D1117] border-t border-[#1A2A3A] shrink-0">
        <span className="font-mono text-[10px] text-[#00D4FF]/60">CUDA C++</span>
        <span className="font-mono text-[10px] text-white/20">·</span>
        <span className="font-mono text-[10px] text-white/30">UTF-8</span>
        <span className="ml-auto font-mono text-[10px] text-[#39FF14]/60">● nebion-cuda</span>
      </div>
    </div>
  );
}
