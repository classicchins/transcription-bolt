import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './home/HomePage';
import { TranscriptionsPage } from './transcriptions/TranscriptionsPage';
import { TranscriptionViewPage } from './transcriptions/TranscriptionViewPage';
import { UploadPage } from './upload/UploadPage';
import { CreditsPage } from './credits/CreditsPage';
import { SettingsPage } from './settings/SettingsPage';
import { NotFoundPage } from './NotFoundPage';

export function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="transcriptions" element={<TranscriptionsPage />} />
      <Route path="transcriptions/:id" element={<TranscriptionViewPage />} />
      <Route path="upload" element={<UploadPage />} />
      <Route path="credits" element={<CreditsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}