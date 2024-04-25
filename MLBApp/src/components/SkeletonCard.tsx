import React from "react";
import { Card } from "../@/components/ui/card";
import { Skeleton } from "src/@/components/ui/skeleton";

const SkeletonCard = () => {
  return (
    <Card className="max-w-full w-full flex flex-col items-center justify-center p-8 pt-4 my-4">
      <div className="flex flex-col space-y-3 w-full">
        <Skeleton className="h-[125px] w-full max-w-[350px] self-center rounded-xl" />
        <div className="space-y-2 w-full px-4">
          <Skeleton className="h-4 w-3/4 max-w-[250px] self-center" />
          <Skeleton className="h-4 w-2/3 max-w-[200px] self-center" />
        </div>
      </div>
    </Card>
  );
};

export default SkeletonCard;
