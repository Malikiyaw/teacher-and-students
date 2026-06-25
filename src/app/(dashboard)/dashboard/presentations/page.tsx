import Link from "next/link";
import { Plus, Presentation, Clock, MoreHorizontal, Grid3X3, List } from "lucide-react";

const presentations = [
  {
    id: "1",
    title: "Photosynthesis Deep Dive",
    subject: "Biology 101",
    slides: 18,
    lastEdited: "2 hours ago",
    thumbnail: "bg-[#E8D5C4]",
    status: "published",
  },
  {
    id: "2",
    title: "World War II Timeline",
    subject: "History 201",
    slides: 24,
    lastEdited: "Yesterday",
    thumbnail: "bg-[#C4D5E0]",
    status: "draft",
  },
  {
    id: "3",
    title: "Introduction to Algebra",
    subject: "Math 301",
    slides: 12,
    lastEdited: "3 days ago",
    thumbnail: "bg-[#D5E0C4]",
    status: "published",
  },
  {
    id: "4",
    title: "Shakespeare's Hamlet Act III",
    subject: "English 102",
    slides: 32,
    lastEdited: "Last week",
    thumbnail: "bg-[#E0C4D5]",
    status: "draft",
  },
  {
    id: "5",
    title: "Chemical Bonding Basics",
    subject: "Chemistry 201",
    slides: 15,
    lastEdited: "2 weeks ago",
    thumbnail: "bg-[#D5C4E0]",
    status: "published",
  },
  {
    id: "6",
    title: "The Renaissance Period",
    subject: "Art History 101",
    slides: 28,
    lastEdited: "2 weeks ago",
    thumbnail: "bg-[#E0D5C4]",
    status: "draft",
  },
];

export default function PresentationsPage() {
  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-charcoal tracking-tight mb-1">
            Presentations
          </h1>
          <p className="text-sm text-charcoal/45">
            3 of 5 free presentations used
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-white border border-border rounded-lg p-1">
            <button className="p-2 bg-charcoal/5 rounded-md text-charcoal/50">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button className="p-2 text-charcoal/30 hover:text-charcoal/50 transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
          <Link
            href="/editor/new"
            className="flex items-center gap-2 bg-sienna text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-sienna-dark transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            New
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {presentations.map((pres) => (
          <Link
            key={pres.id}
            href={`/editor/${pres.id}`}
            className="group bg-white border border-border rounded-xl overflow-hidden hover:border-charcoal/15 transition-all duration-300"
          >
            <div
              className={`${pres.thumbnail} h-36 flex items-center justify-center relative`}
            >
              <Presentation className="w-10 h-10 text-charcoal/10" />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <div className="bg-white/90 backdrop-blur-sm text-[11px] font-medium text-charcoal/50 px-2.5 py-1 rounded-md">
                  {pres.slides} slides
                </div>
                <button className="bg-white/90 backdrop-blur-sm w-7 h-7 rounded-md flex items-center justify-center text-charcoal/30 hover:text-charcoal/50 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              {pres.status === "draft" && (
                <div className="absolute top-3 left-3 bg-charcoal/70 text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                  Draft
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-charcoal mb-1 group-hover:text-sienna transition-colors">
                {pres.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal/40">
                  {pres.subject}
                </span>
                <span className="text-xs text-charcoal/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {pres.lastEdited}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
