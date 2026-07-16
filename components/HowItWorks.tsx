const STEPS = [
  {
    number: "1",
    title: "Browse the Network",
    description: "Explore Mentors and Mentees across industries and find someone whose experience matches what you're looking for.",
  },
  {
    number: "2",
    title: "Request a Match",
    description: "Click 'Request Match' on any listing and fill out a short profile so we can make the best introduction.",
  },
  {
    number: "3",
    title: "We Review Your Request",
    description: "Our team reviews every request to make sure it's a good fit for both sides.",
  },
  {
    number: "4",
    title: "We Make the Intro",
    description: "If it's a strong fit, we'll facilitate the introduction by email within 7 days so you can begin building a productive mentorship.",
  },
];

export default function HowItWorks() {
  return (
    <div className="mb-10">
      <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-[#fdfefe]">
        How It Works
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="flex flex-col items-center rounded-2xl border border-[#fdfefe]/10 bg-[#0d1a38] px-5 py-6 text-center"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#fdfefe]/10 text-sm font-bold text-[#fdfefe]">
              {step.number}
            </div>
            <p className="mb-2 text-sm font-semibold text-[#fdfefe]">{step.title}</p>
            <p className="text-xs leading-relaxed text-[#727272]">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
