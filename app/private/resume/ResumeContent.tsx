import { loadResume } from "@/lib/resume";

export default async function ResumeContent() {
  const content = await loadResume();

  return (
    <>
      <header className="resume-header">
        <h1>RYAN DHARMA</h1>
        <p className="resume-contact">
          (209) 231-3695 | ryandharma04@gmail.com | linkedin.com/in/ryandharma/
        </p>
      </header>
      {content}
    </>
  );
}
