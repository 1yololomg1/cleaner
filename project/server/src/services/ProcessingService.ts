import { logger } from '../utils/logger';
import { LASParser } from '../utils/lasParser';
import { QualityController } from '../utils/qualityController';
import { ProcessingAlgorithms } from '../utils/processingAlgorithms';
import { MnemonicStandardizer } from '../utils/mnemonicStandardizer';
import { ValidationEngine } from '../utils/validationEngine';

export interface ProcessingOptions {
  denoise: {
    enabled: boolean;
    method: 'savitzky_golay' | 'wavelet' | 'moving_average' | 'gaussian';
    windowSize: number;
    polynomialOrder?: number;
    strength: number;
    preserveSpikes: boolean;
  };
  despike: {
    enabled: boolean;
    method: 'hampel' | 'modified_zscore' | 'iqr' | 'manual';
    threshold: number;
    windowSize: number;
    replacementMethod: 'pchip' | 'linear' | 'median' | 'null';
  };
  validation: {
    enabled: boolean;
    physicalRanges: Record<string, { min: number; max: number }>;
    crossValidation: boolean;
    flagOutliers: boolean;
  };
  mnemonics: {
    enabled: boolean;
    standard: 'api' | 'cwls' | 'custom';
    autoStandardize: boolean;
    preserveOriginal: boolean;
  };
}

export interface ProcessingResult {
  success: boolean;
  processedData: any;
  qcResults: any;
  processingHistory: any[];
  errors?: string[];
  warnings?: string[];
  executionTime: number;
  memoryUsage: number;
}

export class ProcessingService {
  private parser: LASParser;
  private qc: QualityController;
  private algorithms: ProcessingAlgorithms;
  private standardizer: MnemonicStandardizer;
  private validator: ValidationEngine;

  constructor() {
    this.parser = new LASParser();
    this.qc = new QualityController();
    this.algorithms = new ProcessingAlgorithms();
    this.standardizer = new MnemonicStandardizer();
    this.validator = new ValidationEngine();
  }

  async processFile(
    fileBuffer: Buffer,
    fileName: string,
    options: ProcessingOptions,
    userId: string
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    try {
      logger.info(`Starting processing for file: ${fileName}, user: ${userId}`);

      // Step 1: Parse LAS file
      const parsedData = await this.parser.parse(fileBuffer, fileName);
      if (!parsedData.success) {
        throw new Error(`Failed to parse LAS file: ${parsedData.error}`);
      }

      let processedData = { ...parsedData.data };
      const processingHistory: any[] = [];
      const warnings: string[] = [];

      // Step 2: Initial Quality Assessment
      const initialQC = await this.qc.assessQuality(processedData);
      logger.info(`Initial quality score: ${initialQC.overallScore}`);

      // Step 3: Mnemonic Standardization
      if (options.mnemonics.enabled) {
        const standardizationResult = await this.standardizer.standardize(
          processedData,
          options.mnemonics
        );
        
        if (standardizationResult.success) {
          processedData = standardizationResult.data;
          processingHistory.push({
            step: 'mnemonic_standardization',
            timestamp: new Date(),
            parameters: options.mnemonics,
            changes: standardizationResult.changes
          });
        }
      }

      // Step 4: Physical Validation
      if (options.validation.enabled) {
        const validationResult = await this.validator.validate(
          processedData,
          options.validation
        );
        
        warnings.push(...validationResult.warnings);
        processingHistory.push({
          step: 'physical_validation',
          timestamp: new Date(),
          parameters: options.validation,
          issues: validationResult.issues
        });
      }

      // Step 5: Denoising
      if (options.denoise.enabled) {
        const denoisingResult = await this.algorithms.denoise(
          processedData,
          options.denoise
        );
        
        if (denoisingResult.success) {
          processedData = denoisingResult.data;
          processingHistory.push({
            step: 'denoising',
            timestamp: new Date(),
            parameters: options.denoise,
            metrics: denoisingResult.metrics
          });
        }
      }

      // Step 6: Spike Detection and Removal
      if (options.despike.enabled) {
        const despikingResult = await this.algorithms.despike(
          processedData,
          options.despike
        );
        
        if (despikingResult.success) {
          processedData = despikingResult.data;
          processingHistory.push({
            step: 'despiking',
            timestamp: new Date(),
            parameters: options.despike,
            spikesDetected: despikingResult.spikesDetected,
            spikesRemoved: despikingResult.spikesRemoved
          });
        }
      }

      // Step 7: Final Quality Assessment
      const finalQC = await this.qc.assessQuality(processedData);
      const qualityImprovement = finalQC.overallScore - initialQC.overallScore;

      // Step 8: Generate Processing Certificate
      const certificate = this.generateProcessingCertificate(
        fileName,
        userId,
        processingHistory,
        initialQC,
        finalQC
      );

      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      const executionTime = endTime - startTime;
      const memoryUsage = endMemory.heapUsed - startMemory.heapUsed;

      logger.info(`Processing completed for ${fileName} in ${executionTime}ms`);
      logger.info(`Quality improvement: ${qualityImprovement.toFixed(2)} points`);

      return {
        success: true,
        processedData,
        qcResults: finalQC,
        processingHistory,
        warnings,
        executionTime,
        memoryUsage
      };

    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      logger.error(`Processing failed for ${fileName}:`, error);
      
      return {
        success: false,
        processedData: null,
        qcResults: null,
        processingHistory: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        executionTime,
        memoryUsage: 0
      };
    }
  }

  private generateProcessingCertificate(
    fileName: string,
    userId: string,
    history: any[],
    initialQC: any,
    finalQC: any
  ) {
    return {
      id: `POLISH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName,
      userId,
      timestamp: new Date(),
      version: '1.0.0',
      processingSteps: history.length,
      qualityImprovement: finalQC.overallScore - initialQC.overallScore,
      initialQuality: initialQC.overallScore,
      finalQuality: finalQC.overallScore,
      algorithms: history.map(h => h.step),
      signature: this.generateSignature(fileName, userId, history)
    };
  }

  private generateSignature(fileName: string, userId: string, history: any[]): string {
    // Generate a cryptographic signature for the processing certificate
    const crypto = require('crypto');
    const data = `${fileName}:${userId}:${JSON.stringify(history)}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}