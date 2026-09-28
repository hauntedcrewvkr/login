/**
 * Standardized Application Error structure.
 * Designed to prevent leaking internal stack traces to the client layer while preserving audit detail.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human readable error explanation.
   * @param {string} code - Machine-readable error code.
   * @param {number} statusCode - HTTP status code.
   * @param {object} [details] - Additional contextual data.
   */
  constructor(message, code = "INTERNAL_ERROR", statusCode = 500, details = null) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  /**
   * Converts error into a predictable client-facing response object.
   * @returns {{ success: boolean, data: null, error: { message: string, code: string } }}
   */
  toClientResponse() {
    return {
      success: false,
      data: null,
      error: {
        message: this.message,
        code: this.code,
      },
    };
  }
}
