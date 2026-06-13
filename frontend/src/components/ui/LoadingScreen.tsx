interface LoadingScreenProps {
  text: string
  subtext?: string
}

export default function LoadingScreen({ text, subtext }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-xs tracking-widest text-gold uppercase mb-4 animate-pulse">
          {text}
        </p>
        {subtext && <p className="text-muted text-sm">{subtext}</p>}
      </div>
    </div>
  )
}