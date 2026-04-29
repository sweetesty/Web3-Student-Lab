import React, { useState, useEffect } from 'react';
import { 
  BriefcaseIcon, 
  CheckBadgeIcon, 
  CurrencyDollarIcon, 
  MapPinIcon, 
  ClockIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface Milestone {
  description: string;
  amount: number;
  completed: boolean;
}

interface Job {
  id: number;
  employer: string;
  title: string;
  description: string;
  budget: number;
  milestones: Milestone[];
  requiredSkills: string[];
  status: 'Open' | 'InProgress' | 'Completed' | 'Disputed';
}

const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-jobs' | 'verify'>('browse');

  useEffect(() => {
    const dummyJobs: Job[] = [
      {
        id: 1,
        employer: 'StellarDevHub',
        title: 'Senior Soroban Developer',
        description: 'We are looking for an expert in Rust and Soroban to build our core infrastructure...',
        budget: 5000,
        requiredSkills: ['Rust', 'Soroban', 'Stellar SDK'],
        status: 'Open',
        milestones: [
          { description: 'Contract Architecture', amount: 1500, completed: false },
          { description: 'Logic Implementation', amount: 2500, completed: false },
          { description: 'Testing & Audit', amount: 1000, completed: false }
        ]
      },
      {
        id: 2,
        employer: 'Web3 Academy',
        title: 'Curriculum Designer',
        description: 'Help us design the next generation of Web3 education materials...',
        budget: 3000,
        requiredSkills: ['Technical Writing', 'Blockchain Basics'],
        status: 'InProgress',
        milestones: [
          { description: 'Intro Module', amount: 1000, completed: true },
          { description: 'Advanced Module', amount: 2000, completed: false }
        ]
      }
    ];
    setJobs(dummyJobs);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              DeWork Hub
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Verified Skills. Guaranteed Payments. Zero Friction.</p>
          </div>
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 backdrop-blur-xl">
            {(['browse', 'my-jobs', 'verify'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'browse' && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Search jobs by skill, title, or employer..."
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                    <BriefcaseIcon className="w-5 h-5 absolute left-4 top-4.5 text-slate-500" />
                  </div>
                  <button className="bg-slate-800 hover:bg-slate-700 px-6 py-4 rounded-2xl font-bold transition-colors border border-slate-700">
                    Filters
                  </button>
                </div>

                {jobs.map(job => (
                  <div key={job.id} className="group relative bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 hover:bg-slate-900/60 transition-all hover:border-indigo-500/50">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-xl border border-indigo-500/20">
                          {job.employer[0]}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                          <p className="text-slate-500 font-medium flex items-center gap-1">
                            <ShieldCheckIcon className="w-4 h-4" /> {job.employer}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-green-400">${job.budget}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Escrowed</p>
                      </div>
                    </div>

                    <p className="text-slate-400 leading-relaxed mb-8 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {job.requiredSkills.map(skill => (
                        <span key={skill} className="flex items-center gap-1.5 bg-indigo-950/40 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-500/20">
                          <CheckBadgeIcon className="w-3.5 h-3.5" /> {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> 3d left</span>
                        <span className="flex items-center gap-1"><AcademicCapIcon className="w-4 h-4" /> 12 applications</span>
                      </div>
                      <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-black transition-all shadow-lg shadow-indigo-900/20 group-hover:scale-105">
                        Apply Now <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* User Profile / Skills */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-slate-900/50 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-2xl border border-white/10">
                  JD
                </div>
                <div>
                  <h4 className="text-xl font-bold">John Doe</h4>
                  <p className="text-indigo-400 text-sm font-bold flex items-center gap-1">
                    <CheckBadgeIcon className="w-4 h-4" /> Level 4 Verified
                  </p>
                </div>
              </div>
              
              <h5 className="text-xs uppercase tracking-widest font-black text-slate-500 mb-4">Verified Skills</h5>
              <div className="space-y-3">
                {[
                  { name: 'Rust', level: 92 },
                  { name: 'Soroban', level: 85 },
                  { name: 'Frontend', level: 78 }
                ].map(skill => (
                  <div key={skill.name} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold">{skill.name}</span>
                      <span className="text-xs font-black text-indigo-400">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${skill.level}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 py-4 rounded-2xl font-black transition-all">
                Update Skills
              </button>
            </div>

            {/* Escrow Status */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold">Safe-Pay Escrow</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-medium">Locked Funds</span>
                  <span className="text-xl font-black">$4,500.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-medium">In Dispute</span>
                  <span className="text-xl font-black text-red-400">$0.00</span>
                </div>
                <div className="pt-6 border-t border-slate-800">
                  <p className="text-xs text-slate-500 font-bold mb-4">ACTIVE MILESTONES</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm font-medium">Contract Init released</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                      <span className="text-sm font-medium text-slate-500">UI Draft pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobBoard;
