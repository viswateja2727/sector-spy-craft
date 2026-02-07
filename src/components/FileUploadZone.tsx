import { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  acceptedFile?: File | null;
}

export function FileUploadZone({ onFileSelect, isProcessing, acceptedFile }: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.md', '.markdown', '.txt'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(extension)) {
      setError('Please upload a Markdown (.md) file');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label
        htmlFor="file-upload"
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
          isDragActive && "border-[hsl(var(--kelp-pink))] bg-[hsl(var(--kelp-pink))]/5 scale-[1.02]",
          acceptedFile && !isProcessing && "border-green-500 bg-green-50 dark:bg-green-950/20",
          error && "border-destructive bg-destructive/5",
          !isDragActive && !acceptedFile && !error && "border-border hover:border-[hsl(var(--kelp-pink))]/50 hover:bg-muted/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          {isProcessing ? (
            <>
              <div className="w-12 h-12 mb-4 rounded-full kelp-gradient animate-spin" style={{ animationDuration: '1.5s' }}>
                <div className="w-full h-full rounded-full bg-background m-0.5" />
              </div>
              <p className="text-lg font-medium text-foreground">Processing file...</p>
            </>
          ) : acceptedFile ? (
            <>
              <CheckCircle2 className="w-12 h-12 mb-4 text-green-500" />
              <p className="text-lg font-medium text-foreground">{acceptedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">File ready for processing</p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-12 h-12 mb-4 text-destructive" />
              <p className="text-lg font-medium text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground mt-1">Click or drag to try again</p>
            </>
          ) : (
            <>
              <div className="p-4 rounded-full bg-muted mb-4">
                {isDragActive ? (
                  <FileText className="w-8 h-8 text-[hsl(var(--kelp-pink))]" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive ? 'Drop your file here' : 'Drop company data file here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or <span className="kelp-gradient-text font-medium">browse</span> to upload
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Supports Markdown (.md) files up to 5MB
              </p>
            </>
          )}
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".md,.markdown,.txt"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
      </label>
    </div>
  );
}
