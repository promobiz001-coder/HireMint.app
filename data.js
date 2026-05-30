// Shared freelancer dataset for HireMint static site
window.HIREMINT_FREELANCERS = [
  { id: 1, name: "Sarah A.", initials: "SA", role: "Senior React Developer", rate: 85, rating: 4.9, jobs: 142, badge: "Top Rated", category: "development", tags: ["React", "TypeScript", "Next.js"] },
  { id: 2, name: "Marcus K.", initials: "MK", role: "Product Designer", rate: 70, rating: 5.0, jobs: 89, badge: "Rising Talent", category: "design", tags: ["Figma", "UI/UX", "Branding"] },
  { id: 3, name: "Elena L.", initials: "EL", role: "Content Strategist", rate: 60, rating: 4.8, jobs: 203, badge: "Top Rated", category: "writing", tags: ["SEO", "Copywriting", "Strategy"] },
  { id: 4, name: "David R.", initials: "DR", role: "Full-Stack Engineer", rate: 95, rating: 4.9, jobs: 175, badge: "Top Rated", category: "development", tags: ["Node.js", "AWS", "Python"] },
  { id: 5, name: "Julia M.", initials: "JM", role: "Motion Designer", rate: 75, rating: 5.0, jobs: 67, badge: "Rising Talent", category: "video", tags: ["After Effects", "3D", "Animation"] },
  { id: 6, name: "Tomás O.", initials: "TO", role: "Growth Marketer", rate: 80, rating: 4.9, jobs: 118, badge: "Top Rated", category: "marketing", tags: ["Paid Ads", "Analytics", "CRO"] },
  { id: 7, name: "Priya S.", initials: "PS", role: "Mobile Developer", rate: 90, rating: 4.9, jobs: 134, badge: "Top Rated", category: "development", tags: ["iOS", "Swift", "Flutter"] },
  { id: 8, name: "Noah B.", initials: "NB", role: "Brand Designer", rate: 65, rating: 4.8, jobs: 92, badge: "Top Rated", category: "design", tags: ["Logo", "Identity", "Illustration"] },
  { id: 9, name: "Aisha R.", initials: "AR", role: "Technical Writer", rate: 55, rating: 4.9, jobs: 156, badge: "Top Rated", category: "writing", tags: ["Docs", "API", "Tutorials"] },
  { id: 10, name: "Lukas H.", initials: "LH", role: "Data Engineer", rate: 100, rating: 5.0, jobs: 78, badge: "Top Rated", category: "data", tags: ["SQL", "Python", "Spark"] },
  { id: 11, name: "Mei C.", initials: "MC", role: "Voiceover Artist", rate: 50, rating: 4.9, jobs: 211, badge: "Top Rated", category: "audio", tags: ["Voiceover", "Narration", "Dubbing"] },
  { id: 12, name: "Owen P.", initials: "OP", role: "Business Consultant", rate: 120, rating: 4.8, jobs: 64, badge: "Top Rated", category: "business", tags: ["Strategy", "Ops", "Finance"] },
];

window.HIREMINT_CATEGORIES = [
  { slug: "development", icon: "💻", title: "Development", desc: "Web, mobile, backend & DevOps" },
  { slug: "design", icon: "🎨", title: "Design", desc: "UI/UX, branding & illustration" },
  { slug: "writing", icon: "✍️", title: "Writing", desc: "Content, copy & technical writing" },
  { slug: "marketing", icon: "📈", title: "Marketing", desc: "SEO, social & growth strategy" },
  { slug: "video", icon: "🎬", title: "Video", desc: "Editing, motion & animation" },
  { slug: "audio", icon: "🎙️", title: "Audio", desc: "Voiceover, mixing & production" },
  { slug: "data", icon: "📊", title: "Data", desc: "Analytics, ML & data engineering" },
  { slug: "business", icon: "💼", title: "Business", desc: "Consulting, ops & finance" },
];

window.renderFreelancerCard = function (f) {
  return `
    <article class="fl-card">
      <div class="fl-top">
        <div class="fl-avatar">${f.initials}</div>
        <div>
          <div class="fl-name">${f.name}</div>
          <div class="fl-role">${f.role}</div>
        </div>
        <div class="fl-rate">$${f.rate}/h</div>
      </div>
      <div class="fl-tags">${f.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
      <div class="fl-meta">
        <span><span class="star">★</span> ${f.rating} · ${f.jobs} jobs</span>
        <span>${f.badge}</span>
      </div>
      <a href="register.html?from=profile&id=${f.id}" class="btn btn-outline" style="margin-top:4px;">View profile</a>
    </article>
  `;
};
