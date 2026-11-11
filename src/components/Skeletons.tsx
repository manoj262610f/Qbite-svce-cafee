import React from 'react';

export const FoodCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#151515] rounded-3xl p-3 border border-white/10 shadow-md animate-pulse flex flex-col justify-between">
      <div>
        <div className="w-full h-32 bg-[#000000] rounded-2xl mb-3" />
        <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
        <div className="h-3 bg-white/5 rounded w-full mb-1" />
        <div className="h-3 bg-white/5 rounded w-2/3 mb-3" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div className="h-5 bg-white/10 rounded w-14" />
        <div className="h-8 bg-[#FF6B00]/20 rounded-xl w-18" />
      </div>
    </div>
  );
};

export const OrderSkeleton: React.FC = () => {
  return (
    <div className="bg-[#151515] rounded-3xl p-4 border border-white/10 shadow-md animate-pulse mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-white/10 rounded w-28" />
        <div className="h-6 bg-white/5 rounded-full w-20" />
      </div>
      <div className="flex items-center gap-3 my-3">
        <div className="w-14 h-14 bg-[#000000] rounded-2xl" />
        <div className="flex-1">
          <div className="h-4 bg-white/10 rounded w-1/2 mb-1.5" />
          <div className="h-3 bg-white/5 rounded w-1/3" />
        </div>
      </div>
      <div className="h-10 bg-[#000000] rounded-xl w-full" />
    </div>
  );
};

export const QueueSkeleton: React.FC = () => {
  return (
    <div className="bg-[#151515] rounded-3xl p-5 text-white border border-white/10 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-24 mb-4" />
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 bg-white/5 rounded w-16 mb-2" />
          <div className="h-8 bg-white/10 rounded w-20" />
        </div>
        <div className="h-10 w-28 bg-[#000000] rounded-xl" />
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 bg-[#151515] border border-white/10 rounded-3xl" />
        <div className="h-24 bg-[#151515] border border-white/10 rounded-3xl" />
      </div>
      <div className="h-48 bg-[#151515] border border-white/10 rounded-3xl" />
      <div className="h-64 bg-[#151515] border border-white/10 rounded-3xl" />
    </div>
  );
};
