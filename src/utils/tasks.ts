/**
 * 用于并发执行多个异步任务并聚合结果的任务管理器。
 *
 * `Tasks.of` 支持控制并发数、进度回调、任务超时以及带退避的无限重试机制。
 * 当某个任务失败时会按指数退避进行重试，直至成功或达到最大重试次数。
 *
 * @summary 用于并发执行多个异步任务并聚合结果的任务管理器。
 *
 * @since 26.4.13
 *
 * @example
 * ```ts
 * const tasks = [
 *   () => fetch("/api/a").then(r => r.json()),
 *   () => fetch("/api/b").then(r => r.json()),
 * ]
 * const results = await Tasks.of(tasks, (total, finished) => {
 *   console.log(`${finished}/${total}`)
 * }, { concurrency: 2, timeout: 5000, maxRetries: 3 })
 * ```
 */
export class Tasks {
  /**
   * 并发执行一组异步任务，并返回按原始顺序排列的结果数组。
   *
   * 任务数量为空或传入非数组时，立即返回空数组。方法内部会创建若干工作协程，
   * 每个协程从任务队列中依次取任务执行。失败的任务会根据 `retryDelay` 与
   * `maxRetryDelay` 进行指数退避重试，直到成功或超过 `maxRetries`。
   *
   * @summary 并发执行一组异步任务，并返回按原始顺序排列的结果数组。
   *
   * @typeParam T 任务返回值的类型。
   * @param tasks 需要执行的任务数组，每个任务为返回 `Promise<T>` 的函数。
   * @param onProgress 可选的进度回调，参数为任务总数与已完成任务数。
   * @param options 可选的执行配置，包含并发数、重试延迟、最大重试延迟、
   *                超时时间与最大重试次数。
   * @returns 所有任务成功后的结果数组，顺序与输入任务一致。
   * @throws {Error} 当任务失败次数超过 `maxRetries` 时，抛出 `"max retries exceeded"`。
   * @throws {Error} 当任务在 `timeout` 时间内未完成时，抛出 `"timeout"`。
   * @since 26.4.13
   */
  static async of<T>(
    tasks: (() => Promise<T>)[],
    onProgress?: (total: number, finished: number) => void,
    options?: {
      concurrency?: number
      retryDelay?: number
      maxRetryDelay?: number
      timeout?: number
      maxRetries?: number
    },
  ) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return []
    }

    const {
      concurrency = 6,
      retryDelay = 50,
      maxRetryDelay = 2000,
      timeout,
      maxRetries = Number.POSITIVE_INFINITY,
    } = options ?? {}

    const results: T[] = new Array(tasks.length)

    let finished = 0

    const triggerProgress = () => {
      if (!onProgress) return
      onProgress(tasks.length, finished)
    }

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const withTimeout = async (p: Promise<T>) => {
      if (!timeout) return p

      return Promise.race([
        p,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout)),
      ])
    }

    async function retry(task: () => Promise<T>, retryCount = 0) {
      let delay = retryDelay

      while (true) {
        try {
          const value = await withTimeout(task())
          return value
        } catch {
          if (retryCount >= maxRetries) {
            throw new Error("max retries exceeded")
          }
          retryCount++
          await sleep(delay)

          delay = Math.min(delay * 2, maxRetryDelay)
        }
      }
    }

    let cursor = 0

    async function worker() {
      while (true) {
        const index = cursor++

        if (index >= tasks.length) return

        const value = await retry(tasks[index])

        results[index] = value

        finished++
        triggerProgress()
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())

    await Promise.all(workers)

    return results
  }
}
