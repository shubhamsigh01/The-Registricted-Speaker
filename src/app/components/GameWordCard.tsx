interface GameWordCardProps {
  word: string;
  color: string;
}

export function GameWordCard({ word, color }: GameWordCardProps) {
  return (
    <div
      className="w-full max-w-[320px] h-[200px] md:max-w-[560px] md:h-[320px] lg:max-w-[680px] lg:h-[380px] rounded-2xl flex items-center justify-center p-8 mx-auto"
      style={{
        backgroundColor: color,
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
      }}
    >
      <h1 className="text-white font-extrabold text-center uppercase break-words" style={{ fontSize: 'var(--text-card-word)' }}>
        {word}
      </h1>
    </div>
  );
}
