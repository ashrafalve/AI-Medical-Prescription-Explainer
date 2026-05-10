'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, X, CheckCircle, Loader2, AlertTriangle, CloudUpload } from 'lucide-react'
import toast from 'react-hot-toast'
import { prescriptionApi } from '@/services/api'
import { formatBytes, getErrorMessage } from '@/lib/utils'

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
}

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [uploadedId, setUploadedId] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[], rejected: File[]) => {
    if (rejected.length > 0) {
      toast.error('File not supported. Please upload a JPG, PNG, WebP, or PDF.')
      return
    }
    const f = accepted[0]
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.')
      return
    }
    setFile(f)
    setState('idle')
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return
    setState('uploading')
    try {
      const result = await prescriptionApi.upload(file)
      setUploadedId(result.id)
      setState('success')
      toast.success('Uploaded! AI analysis running in the background.')
    } catch (err) {
      setState('error')
      toast.error(getErrorMessage(err))
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setState('idle')
    setUploadedId(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Upload Prescription</h1>
        <p className="text-muted-foreground mt-1">Upload a prescription image or PDF. AI will extract and explain everything.</p>
      </div>

      <AnimatePresence mode="wait">
        {state === 'success' ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Upload Successful!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your prescription has been uploaded. AI analysis is running in the background — this usually takes 15–30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => router.push(`/dashboard/result/${uploadedId}`)} className="btn-primary">
                View Analysis Result
              </button>
              <button onClick={handleReset} className="btn-secondary">Upload Another</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
                ${isDragActive
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30'
                  : 'border-border hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-950/20'
                }
              `}
            >
              <input {...getInputProps()} id="file-upload-input" />
              <div className="space-y-4">
                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center transition-transform duration-200 ${isDragActive ? 'scale-110' : ''} bg-brand-50 dark:bg-brand-950/50`}>
                  <CloudUpload className={`w-8 h-8 ${isDragActive ? 'text-brand-500' : 'text-brand-400'}`} />
                </div>
                {isDragActive ? (
                  <p className="text-brand-600 dark:text-brand-400 font-semibold">Drop your file here!</p>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-foreground">Drag & drop your prescription</p>
                      <p className="text-muted-foreground text-sm mt-1">or <span className="text-brand-600 underline cursor-pointer">browse files</span></p>
                    </div>
                    <p className="text-xs text-muted-foreground">Supports: JPG, PNG, WebP, PDF — Max 10MB</p>
                  </>
                )}
              </div>
            </div>

            {/* File Preview */}
            {file && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
                <div className="flex items-center gap-4">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-border flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-8 h-8 text-brand-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.size)} · {file.type}</p>
                    {state === 'uploading' && (
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '90%' }}
                          transition={{ duration: 2, ease: 'easeOut' }}
                        />
                      </div>
                    )}
                  </div>
                  <button onClick={handleReset} className="p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            )}

            {state === 'error' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Upload failed. Please try again.
              </div>
            )}

            <button
              id="upload-submit-btn"
              onClick={handleUpload}
              disabled={!file || state === 'uploading'}
              className="btn-primary w-full py-3.5 text-base"
            >
              {state === 'uploading' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Uploading & Processing…</>
              ) : (
                <><Upload className="w-5 h-5" /> Upload & Analyse</>
              )}
            </button>

            {/* Tips */}
            <div className="card p-5 space-y-2">
              <p className="text-sm font-semibold text-foreground">📋 Tips for best results:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Take the photo in good lighting, all text clearly visible</li>
                <li>• Make sure the image is not blurry or tilted</li>
                <li>• Include the full prescription — don&apos;t crop out any part</li>
                <li>• Digital PDFs from pharmacies give the best OCR accuracy</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="disclaimer-box">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm">
          <strong>Privacy:</strong> Your prescriptions are processed securely and used only to generate your explanation. AiMedico does not share your data.
        </p>
      </div>
    </div>
  )
}
