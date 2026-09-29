import React from 'react';

export const FoodCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#141414] rounded-2xl p-3 border border-white/5 shadow-md animate-pulse flex flex-col justify-between">
      <div>
        <div className="w-full h-32 bg-[#202020] rounded-xl mb-3" />
        <div className="h-4 bg-[#262626] rounded w-3/4 mb-2" />
        <div className="h-3 bg-[#1C1C1C] rounded w-full mb-1" />
        <div className="h-3 bg-[#1C1C1C] rounded w-2/3 mb-3" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="h-5 bg-[#262626] rounded w-14" />
        <div className="h-8 bg-[#FF6A00]/20 rounded-xl w-18" />
      </div>
    </div>
  );
};

export const OrderSkeleton: React.FC = () => {
  return (
    <div className="bg-[#141414] rounded-2xl p-4 border border-white/5 shadow-md animate-pulse mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-[#262626] rounded w-28" />
        <div className="h-6 bg-[#202020] rounded-full w-20" />
      </div>
      <div className="flex items-center gap-3 my-3">
        <div className="w-14 h-14 bg-[#202020] rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-[#262626] rounded w-1/2 mb-1.5" />
          <div className="h-3 bg-[#1C1C1C] rounded w-1/3" />
        </div>
      </div>
      <div className="h-10 bg-[#1C1C1C] rounded-xl w-full" />
    </div>
  );
};

export const QueueSkeleton: React.FC = () => {
  return (
    <div className="bg-[#141414] rounded-2xl p-5 text-white border border-white/5 animate-pulse">
      <div className="h-4 bg-[#202020] rounded w-24 mb-4" />
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 bg-[#202020] rounded w-16 mb-2" />
          <div className="h-8 bg-[#2A2A2A] rounded w-20" />
        </div>
        <div className="h-10 w-28 bg-[#262626] rounded-xl" />
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 bg-[#141414] border border-white/5 rounded-2xl" />
        <div className="h-24 bg-[#141414] border border-white/5 rounded-2xl" />
      </div>
      <div className="h-48 bg-[#141414] border border-white/5 rounded-2xl" />
      <div className="h-64 bg-[#141414] border border-white/5 rounded-2xl" />
    </div>
  );
};
