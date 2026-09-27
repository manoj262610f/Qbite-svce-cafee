import React from 'react';

export const FoodCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-3 border border-stone-100 shadow-sm animate-pulse flex flex-col justify-between">
      <div>
        <div className="w-full h-32 bg-stone-200 rounded-xl mb-3" />
        <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-stone-100 rounded w-full mb-1" />
        <div className="h-3 bg-stone-100 rounded w-2/3 mb-3" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-stone-50">
        <div className="h-5 bg-stone-200 rounded w-14" />
        <div className="h-9 bg-stone-200 rounded-xl w-20" />
      </div>
    </div>
  );
};

export const OrderSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm animate-pulse mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-stone-200 rounded w-28" />
        <div className="h-6 bg-stone-200 rounded-full w-20" />
      </div>
      <div className="flex items-center gap-3 my-3">
        <div className="w-14 h-14 bg-stone-200 rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-stone-200 rounded w-1/2 mb-1" />
          <div className="h-3 bg-stone-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-10 bg-stone-100 rounded-xl w-full" />
    </div>
  );
};

export const QueueSkeleton: React.FC = () => {
  return (
    <div className="bg-stone-900 rounded-2xl p-5 text-white animate-pulse">
      <div className="h-4 bg-stone-800 rounded w-24 mb-4" />
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 bg-stone-800 rounded w-16 mb-2" />
          <div className="h-8 bg-stone-700 rounded w-20" />
        </div>
        <div className="h-10 w-28 bg-stone-800 rounded-xl" />
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 bg-stone-200 rounded-2xl" />
        <div className="h-24 bg-stone-200 rounded-2xl" />
      </div>
      <div className="h-48 bg-stone-200 rounded-2xl" />
      <div className="h-64 bg-stone-200 rounded-2xl" />
    </div>
  );
};
