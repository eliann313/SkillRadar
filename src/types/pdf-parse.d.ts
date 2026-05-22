declare module "pdf-parse" {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: unknown;
    metadata: unknown;
    text: string;
    version: string;
  }
  function pdf(dataBuffer: Buffer, options?: unknown): Promise<PDFParseResult>;
  export = pdf;
}
