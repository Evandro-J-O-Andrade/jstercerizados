import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Video, BookOpen } from 'lucide-react';
import { AVA_MODULES, AVA_ICON_COMPONENTS } from '../services';
import { useAva } from '../context/AvaContext';
import { VideoPlayer } from '../components/VideoPlayer';
import { StepGuide } from '../components/StepGuide';

export function AvaTutorialPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getTutorial, getVideoAsset } = useAva();
  const [currentStep, setCurrentStep] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const tutorial = slug ? getTutorial(slug) : null;

  useEffect(() => {
    if (!tutorial) return;
    let alive = true;
    getVideoAsset(tutorial.id).then((asset) => {
      if (alive && asset) setVideoSrc(asset.file_url);
    });
    return () => {
      alive = false;
    };
  }, [tutorial, getVideoAsset]);

  if (!tutorial) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <BookOpen className="text-muted-foreground h-12 w-12" />
        <p className="text-muted-foreground mt-4 text-sm">
          Tutorial nao encontrado.
        </p>
        <button
          type="button"
          onClick={() => navigate('/ava')}
          className="text-primary mt-2 text-sm font-medium hover:underline"
        >
          Voltar para central
        </button>
      </div>
    );
  }

  const mod = AVA_MODULES[tutorial.module];
  const Icon = mod ? AVA_ICON_COMPONENTS[mod.icon] : Video;
  const durationLabel = tutorial.videoDurationSeconds
    ? `${Math.round(tutorial.videoDurationSeconds / 60)} min`
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div>
        <div className="mb-2 flex items-center gap-2">
          {Icon ? <Icon className="text-primary h-5 w-5" /> : null}
          <span className="text-primary text-xs font-medium">
            {mod ? mod.label : tutorial.module}
          </span>
          {durationLabel && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {durationLabel}
            </span>
          )}
        </div>
        <h1 className="text-foreground text-2xl font-bold">{tutorial.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {tutorial.summary || tutorial.description}
        </p>
      </div>

      <VideoPlayer src={videoSrc || tutorial.videoUrl} title={tutorial.title} />

      {tutorial.steps.length > 0 && (
        <StepGuide
          steps={tutorial.steps}
          currentStep={currentStep}
          onStepSelect={setCurrentStep}
        />
      )}

      {tutorial.faq.length > 0 && (
        <div>
          <h2 className="text-foreground mb-3 text-sm font-semibold">
            Perguntas frequentes
          </h2>
          <div className="space-y-2">
            {tutorial.faq.map((item, index) => (
              <div key={index} className="rounded-lg border p-3">
                <p className="text-foreground text-sm font-medium">
                  {item.question}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AvaTutorialPage;
