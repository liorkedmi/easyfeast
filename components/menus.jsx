import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ClassicsMenu from "@/components/menus/classics";
import ExtrasMenu from "@/components/menus/extras";
import History from "@/components/menus/history";
import SeasonalMenu from "@/components/menus/seasonal";
import { Suspense } from "react";

export default async function Menus() {
  return (
    <Tabs defaultValue="seasonal" className="w-[800px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
        <TabsTrigger value="classics">Family Classics</TabsTrigger>
        <TabsTrigger value="favorites">Your History</TabsTrigger>
        <TabsTrigger value="extras">Extras</TabsTrigger>
      </TabsList>
      <TabsContent value="seasonal">
        <Suspense fallback={<h2>Loading...</h2>}>
          <SeasonalMenu />
        </Suspense>
      </TabsContent>
      <TabsContent value="classics">
        <Suspense fallback={<h2>Loading...</h2>}>
          <ClassicsMenu />
        </Suspense>
      </TabsContent>
      <TabsContent value="favorites">
        <Suspense fallback={<h2>Loading...</h2>}>
          <History />
        </Suspense>
      </TabsContent>
      <TabsContent value="extras">
        <Suspense fallback={<h2>Loading...</h2>}>
          <ExtrasMenu />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
