import Link from "next/link";
import { getActiveProfiles } from "@/lib/airtable";
import Board from "@/components/Board";
import HowItWorks from "@/components/HowItWorks";
import RemoveSection from "@/components/RemoveSection";
import { Profile } from "@/components/Card";

const MOCK_PROFILES: Profile[] = [
  { id: "1", type: "mentor", name: "Sarah Chen", email: "sarah@example.com", industry: "Technology", role: "Senior Software Engineer", bio: "10 years in backend engineering across fintech and SaaS. I specialise in distributed systems and API design. I love helping early-career devs build solid foundations, navigate their first senior role, and figure out what kind of engineer they want to become.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "2", type: "mentor", name: "James Okafor", email: "james@example.com", industry: "Finance", role: "Investment Analyst", bio: "Spent six years across two hedge funds and an early-stage startup. I can help with breaking into finance, understanding what different roles actually look like day-to-day, and thinking through the move from sell-side to buy-side. Happy to talk honestly about the industry.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "3", type: "mentor", name: "Priya Nair", email: "priya@example.com", industry: "Healthcare", role: "Product Manager", bio: "Building healthcare products for 8 years. Passionate about mentoring PMs.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "4", type: "mentor", name: "David Kim", email: "david@example.com", industry: "Marketing", role: "Brand Strategist", bio: "Built brand strategies for Fortune 500s. Happy to help you break into marketing.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "5", type: "mentor", name: "Elena Vasquez", email: "elena@example.com", industry: "Education", role: "Curriculum Designer", bio: "15 years designing learning experiences. Passionate about EdTech and teaching.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "6", type: "mentor", name: "Marcus Webb", email: "marcus@example.com", industry: "Law", role: "Corporate Attorney", bio: "Specialise in startup law and contracts. Happy to guide anyone entering the legal field.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "7", type: "mentee", name: "Luca Rossi", email: "luca@example.com", industry: "Technology", role: "Junior Developer", bio: "Just graduated, looking for guidance on growing as a full-stack engineer.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "8", type: "mentee", name: "Amara Diallo", email: "amara@example.com", industry: "Finance", role: "Analyst Trainee", bio: "Starting out in finance and looking for a mentor who's been through the grind.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "9", type: "mentee", name: "Tom Walsh", email: "tom@example.com", industry: "Healthcare", role: "UX Researcher", bio: "Transitioning into healthcare tech and would love to learn from someone in the space.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "10", type: "mentee", name: "Chloe Martin", email: "chloe@example.com", industry: "Marketing", role: "Social Media Coordinator", bio: "Looking to move from execution into strategy and grow my marketing career.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "11", type: "mentee", name: "Raj Patel", email: "raj@example.com", industry: "Education", role: "Teaching Assistant", bio: "Hoping to transition into EdTech product roles and would love guidance.", linkedin: null, photo: null, is_active: true, created_at: "" },
  { id: "12", type: "mentee", name: "Nadia Bloom", email: "nadia@example.com", industry: "Law", role: "Paralegal", bio: "Studying for the bar. Looking for a mentor who's navigated big law and come out the other side.", linkedin: null, photo: null, is_active: true, created_at: "" },
];

export default async function Home() {
  let profiles: Profile[] = [];
  try {
    profiles = await getActiveProfiles();
  } catch {
    profiles = MOCK_PROFILES;
  }

  return (
    <div className="min-h-screen bg-[#112148]">
      <header className="border-b border-[#fdfefe]/10 bg-[#0d1a38]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-[#fdfefe]">Venture Cafe Phoenix Mentorship Network</h1>
            <p className="text-sm text-[#727272]">Find Your Mentor Or Mentee</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/calendar"
              className="rounded-lg border border-[#fdfefe]/30 px-4 py-2 text-sm font-medium text-[#fdfefe] hover:bg-[#fdfefe]/10 transition-colors"
            >
              Sessions
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#fdfefe] px-4 py-2 text-sm font-medium text-[#112148] hover:bg-[#e0e4f0] transition-colors"
            >
              Join the Network
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {profiles.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[#727272]">No profiles yet. Be the first to join!</p>
            <Link
              href="/signup"
              className="mt-4 inline-block rounded-lg bg-[#fdfefe] px-5 py-2.5 text-sm font-medium text-[#112148] hover:bg-[#e0e4f0]"
            >
              Sign up →
            </Link>
          </div>
        ) : (
          <>
            <HowItWorks />
            <Board profiles={profiles} />
          </>
        )}
        <RemoveSection />
      </main>
    </div>
  );
}
