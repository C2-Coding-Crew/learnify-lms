import React from "react";
import { Award, Lock } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  criteria: string;
}

interface UserBadge {
  id: number;
  badgeId: number;
  earnedAt: Date;
  badge: Badge;
}

interface BadgeListProps {
  userBadges: UserBadge[];
  allBadges: Badge[];
}

export function BadgeList({ userBadges, allBadges }: BadgeListProps) {
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-50">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
          <Award size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Koleksi Badge 🏅</h2>
          <p className="text-xs font-bold text-slate-400 mt-1">
            {userBadges.length} dari {allBadges.length} badge berhasil diraih
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allBadges.map((badge) => {
          const isEarned = earnedBadgeIds.has(badge.id);
          const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);

          return (
            <div 
              key={badge.id}
              className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col items-center text-center group ${
                isEarned 
                  ? "border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-100" 
                  : "border-slate-100 bg-slate-50/50 opacity-60 grayscale hover:grayscale-0"
              }`}
            >
              {!isEarned && (
                <div className="absolute top-3 right-3 text-slate-300">
                  <Lock size={14} />
                </div>
              )}
              
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center p-2 mb-3">
                <img 
                  src={badge.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${badge.criteria}`} 
                  alt={badge.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h3 className={`font-black text-sm mb-1 ${isEarned ? "text-slate-800" : "text-slate-500"}`}>
                {badge.name}
              </h3>
              
              <p className="text-[10px] font-medium text-slate-400 leading-tight">
                {badge.description}
              </p>

              {isEarned && userBadge && (
                <div className="mt-3 text-[9px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-100 px-2 py-1 rounded-md">
                  Diraih {new Date(userBadge.earnedAt).toLocaleDateString('id-ID')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
