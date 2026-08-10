import logoAsset from "@/assets/logo.png.asset.json";

interface LogoProps {
  className?: string;
  alt?: string;
}

export function Logo({ className = "size-8", alt = "Discipline" }: LogoProps) {
  return <img src={logoAsset.url} alt={alt} className={className} />;
}
