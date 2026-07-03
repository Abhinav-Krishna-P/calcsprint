import React from "react";

export interface Avatar {
  id: string;
  emoji: string;
  label: string;
}

export const AVATARS: Avatar[] = [
  { id: "speed", emoji: "⚡", label: "Speed" },
  { id: "brain", emoji: "🧠", label: "Brain" },
  { id: "rocket", emoji: "🚀", label: "Rocket" },
  { id: "target", emoji: "🎯", label: "Focus" },
  { id: "trophy", emoji: "🏆", label: "Winner" },
  { id: "graduate", emoji: "🎓", label: "Scholar" },
  { id: "fire", emoji: "🔥", label: "Streak" },
  { id: "crown", emoji: "👑", label: "Champ" },
  { id: "numbers", emoji: "🔢", label: "Math" },
  { id: "coder", emoji: "💻", label: "Coder" },
  { id: "fox", emoji: "🦊", label: "Clever" },
  { id: "lion", emoji: "🦁", label: "Fierce" },
  { id: "panda", emoji: "🐼", label: "Calm" },
  { id: "unicorn", emoji: "🦄", label: "Unique" },
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "flex", emoji: "💪", label: "Power" }
];

export const getAvatarById = (id: string): Avatar | undefined => {
  return AVATARS.find(a => a.id === id);
};

interface AvatarSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATARS.map((avatar) => {
        const isSelected = avatar.id === selectedId;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`flex flex-col items-center justify-center p-3 border transition-all duration-150 rounded-app cursor-pointer hover:bg-app-surface-container ${
              isSelected
                ? "border-app-primary bg-app-surface-container shadow-sm ring-2 ring-app-primary"
                : "border-app-outline-variant bg-app-surface"
            }`}
          >
            <span className="text-3xl mb-1 select-none" role="img" aria-label={avatar.label}>
              {avatar.emoji}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-app-secondary">
              {avatar.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
export default AvatarSelector;
