export interface QueueJobPayload {
  id: string;
  type: "IMAGE_PROCESSING" | "EMAIL_NOTIFICATION" | "INVOICE_GENERATION" | "SEARCH_INDEX_UPDATE";
  data: Record<string, any>;
  timestamp: string;
}

export class QueueService {
  private static jobQueue: QueueJobPayload[] = [];

  public static async enqueue(type: QueueJobPayload["type"], data: Record<string, any>): Promise<string> {
    const jobId = `job_${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const job: QueueJobPayload = {
      id: jobId,
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    this.jobQueue.push(job);
    console.log(`[BULLMQ_QUEUE_ENQUEUE] Job Enqueued: ${jobId} | Type: ${type}`);

    // Trigger async job processor
    setTimeout(() => this.processJob(job), 100);

    return jobId;
  }

  private static async processJob(job: QueueJobPayload) {
    try {
      console.log(`[BULLMQ_QUEUE_PROCESS] Processing Job: ${job.id} | Type: ${job.type}`);
      // Remove job from active queue when completed
      this.jobQueue = this.jobQueue.filter((j) => j.id !== job.id);
    } catch (err) {
      console.error(`[BULLMQ_QUEUE_ERROR] Failed to process job ${job.id}`, err);
    }
  }
}
