
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedCalendar } from '@/components/calendar/UnifiedCalendar';

const CalendarPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-4 px-0 sm:py-6 sm:px-2 lg:px-0 xl:max-w-7xl">
        <Card className="shadow-sm h-[calc(100vh-8rem)]">
          <CardHeader className="py-3 px-3 sm:py-6 sm:px-4">
            <CardTitle className="text-lg md:text-2xl">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-4rem)]">
            <UnifiedCalendar fullHeight={true} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
