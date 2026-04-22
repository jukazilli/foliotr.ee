import { PageIntro } from "@/components/app/primitives";
import { AssetGalleryManager } from "@/components/assets/AssetGalleryManager";

export default function GalleryPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Conteudo"
        title="Galeria"
        description="Centralize as imagens que voce ja enviou para reaproveitar no perfil, nas paginas e no editor sem novos uploads."
      />

      <AssetGalleryManager />
    </div>
  );
}
