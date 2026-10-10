import { BookOpen, LayoutDashboard } from 'lucide-react';
import { AVA_ICON_COMPONENTS, buildAvaModuleInfo } from '../services';
import { useAva } from '../context/AvaContext';
import { TutorialSearch } from '../components/TutorialSearch';
import { TutorialCard } from '../components/TutorialCard';

export function AvaDashboard() {
  const {
    selectedModule,
    searchQuery,
    filteredTutorials,
    selectModule,
    setSearchQuery,
    getTutorial,
  } = useAva();

  const moduleInfo = buildAvaModuleInfo(filteredTutorials);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold">
          <BookOpen className="text-primary h-7 w-7" />
          Central de Aprendizado
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tutoriais em video e passo a passo para cada modulo do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="rounded-lg border p-4">
            <h2 className="text-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Modulos
            </h2>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => selectModule(null)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                  selectedModule === null
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Todos</span>
              </button>
              {moduleInfo.map((mod) => {
                const Icon = AVA_ICON_COMPONENTS[mod.icon];
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => selectModule(mod.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      selectedModule === mod.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    <span>{mod.label}</span>
                    <span className="ml-auto text-xs">{mod.tutorialCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4">
            <TutorialSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Busque por modulo, etapa ou palavra-chave..."
            />
          </div>

          {filteredTutorials.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhum tutorial encontrado para os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTutorials.map((tutorial) => (
                <TutorialCard
                  key={tutorial.id}
                  tutorial={tutorial}
                  onClick={() => {
                    const t = getTutorial(tutorial.slug);
                    if (t) {
                      window.location.href = `/ava/${t.slug}`;
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
