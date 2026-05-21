export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAllData = async (api) => {
  try {
    const [studentsRes, instructorsRes, coursesRes, challengesRes, leaderboardRes] = await Promise.all([
      api.get('/admin/students?limit=1000'),
      api.get('/admin/instructors?limit=1000'),
      api.get('/courses?limit=1000'),
      api.get('/challenges?limit=1000'),
      api.get('/leaderboard?limit=1000'),
    ]);

    const students = (studentsRes.data?.data || []).map(s => ({
      fullName: s.fullName,
      email: s.email,
      admissionNumber: s.admissionNumber,
      course: s.assignedCourse?.name || 'N/A',
      instructor: s.assignedInstructor?.fullName || 'N/A',
      plan: s.plan,
      isActive: s.isActive ? 'Yes' : 'No',
    }));

    const instructors = (instructorsRes.data?.data || []).map(i => ({
      fullName: i.fullName,
      email: i.email,
      accountNumber: i.accountNumber,
      course: i.assignedCourse?.name || 'N/A',
      isActive: i.isActive ? 'Yes' : 'No',
    }));

    const courses = (coursesRes.data?.data || []).map(c => ({
      name: c.name,
      description: c.description,
      lessonsCount: c.lessons?.length || 0,
      instructor: c.instructor?.fullName || 'N/A',
    }));

    const challenges = (challengesRes.data?.data || []).map(c => ({
      title: c.title,
      type: c.type,
      difficulty: c.difficulty,
      points: c.points,
      status: c.status,
      startDate: c.startDate ? new Date(c.startDate).toLocaleDateString() : 'N/A',
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'N/A',
    }));

    const leaderboard = (leaderboardRes.data?.data || []).map(l => ({
      rank: l.rank,
      student: l.student?.fullName || 'N/A',
      admissionNumber: l.student?.admissionNumber || 'N/A',
      totalPoints: l.totalPoints,
      weeklyPoints: l.weeklyPoints,
      monthlyPoints: l.monthlyPoints,
      challengesCompleted: l.challengesCompleted,
    }));

    exportToCSV(students, 'students');
    setTimeout(() => exportToCSV(instructors, 'instructors'), 100);
    setTimeout(() => exportToCSV(courses, 'courses'), 200);
    setTimeout(() => exportToCSV(challenges, 'challenges'), 300);
    setTimeout(() => exportToCSV(leaderboard, 'leaderboard'), 400);

    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
};
