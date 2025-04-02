
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarWidget } from '@/components/dashboard/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CalendarPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="calendar-container w-full">
              <CalendarWidget />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
