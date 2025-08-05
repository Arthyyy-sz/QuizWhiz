@@ .. @@
 import React, { useState, useEffect } from 'react';
-import { Brain, Sparkles, Globe, FileText, Settings, Users, BookOpen } from 'lucide-react';
+import { Brain, FileText, Settings, Users, BookOpen } from 'lucide-react';
 import { UserTypeSelector } from './components/UserTypeSelector';
+import { Header } from './components/Header';
+import { DownloadsModal } from './components/DownloadsModal';
 import { EnhancedFileUpload } from './components/EnhancedFileUpload';
 import { LanguageSelector } from './components/LanguageSelector';
 import { QuizTypeSelector } from './components/QuizTypeSelector';
@@ .. @@
 import { QuizReview } from './components/QuizReview';
 import { GroupQuizMode } from './components/GroupQuizMode';
 import { TeacherDashboard } from './components/TeacherDashboard';
 import { StudentDashboard } from './components/StudentDashboard';
+import { LiveLeaderboard } from './components/LiveLeaderboard';
+import { WeeklyPerformance } from './components/WeeklyPerformance';
 import { useSupabaseData } from './hooks/useSupabaseData';
 import { QuizGenerator } from './utils/quizGenerator';
 import { EnhancedFileParser } from './utils/enhancedFileParser';
@@ .. @@
 function App() {
   const [state, setState] = useState<AppState>('userSelection');
   const [currentUser, setCurrentUser] = useState<User | null>(null);
+  const [showDownloads, setShowDownloads] = useState(false);
   const { 
     savedQuizzes, 
     quizAttempts, 
@@ .. @@
   const [isFileMode, setIsFileMode] = useState(true);
   const [isTestMode, setIsTestMode] = useState(false);
   const [isGroupMode, setIsGroupMode] = useState(false);
+  const [activeGroupQuizId, setActiveGroupQuizId] = useState<string | null>(null);

   const handleUserTypeSelection = (userType: UserType, username: string) => {
@@ .. @@
   return (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
       
-      {/* Enhanced Header */}
+      {/* Header */}
       {currentUser && state !== 'userSelection' && (
-        <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
-          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
-            <div className="flex items-center justify-between h-16">
-              <div className="flex items-center space-x-3">
-                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
-                  <Brain className="h-6 w-6 text-white" />
-                </div>
-                <div>
-                  <h1 className="text-xl font-bold text-gray-900">QuizWhiz</h1>
-                  <p className="text-xs text-gray-500">AI-Powered Learning Platform</p>
-                </div>
-              </div>
-              
-              <div className="flex items-center space-x-6">
-                <div className="flex items-center space-x-4 text-sm text-gray-600">
-                  <div className="flex items-center space-x-1">
-                    <Globe className="h-4 w-4" />
-                    <span>Multilingual</span>
-                  </div>
-                  <div className="flex items-center space-x-1">
-                    <Sparkles className="h-4 w-4" />
-                    <span>AI Powered</span>
-                  </div>
-                  {currentUser.type === 'teacher' && (
-                    <div className="flex items-center space-x-1">
-                      <Users className="h-4 w-4" />
-                      <span>Collaborative</span>
-                    </div>
-                  )}
-                </div>
-                
-                <div className="flex items-center space-x-3">
-                  <div className="text-right">
-                    <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
-                    <p className="text-xs text-gray-500 capitalize">{currentUser.type}</p>
-                  </div>
-                  <button
-                    onClick={handleLogout}
-                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
-                  >
-                    Logout
-                  </button>
-                </div>
-              </div>
-            </div>
-          </div>
-        </header>
+        <Header
+          currentUser={currentUser}
+          onLogout={handleLogout}
+          onDownloads={() => setShowDownloads(true)}
+        />
       )}

       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
@@ .. @@
             {/* Dashboard Content */}
             {currentUser.type === 'student' ? (
               <StudentDashboard 
                 user={currentUser}
                 onCreateQuiz={() => setState('input')}
                 onJoinGroup={() => setState('group')}
               />
             ) : (
               <TeacherDashboard 
                 user={currentUser}
                 onCreateQuiz={() => setState('input')}
                 onManageClasses={() => setState('group')}
               />
             )}
+
+            {/* Weekly Performance for Students */}
+            {currentUser.type === 'student' && (
+              <div className="mt-8">
+                <WeeklyPerformance user={currentUser} />
+              </div>
+            )}
+
+            {/* Live Leaderboard for Active Group Quiz */}
+            {activeGroupQuizId && (
+              <div className="mt-8">
+                <LiveLeaderboard 
+                  groupQuizId={activeGroupQuizId} 
+                  user={currentUser} 
+                />
+              </div>
+            )}
           </div>
         )}
@@ .. @@
             <div className="text-center space-y-4">
               <h2 className="text-4xl font-bold text-gray-900">
                 Create Your AI-Powered Quiz
               </h2>
               <p className="text-xl text-gray-600 max-w-3xl mx-auto">
-                Upload documents (PDF, PowerPoint, Word) or paste text in any language. 
-                Our advanced AI will generate intelligent, engaging questions tailored to your needs.
+                Upload documents (PDF, PowerPoint, Word) or paste text. 
+                Generate intelligent, engaging questions tailored to your needs.
               </p>
             </div>
@@ .. @@
           </div>
         )}
       </main>
+
+      {/* Downloads Modal */}
+      <DownloadsModal
+        isOpen={showDownloads}
+        onClose={() => setShowDownloads(false)}
+        user={currentUser!}
+      />
     </div>
   );
 }