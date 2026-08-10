import { useEffect, useState } from "react";

// Hook simple para adaptar el layout en pantallas angostas.
// Se usa junto a estilos inline (en vez de CSS con media queries)
// porque todos los componentes del proyecto ya siguen ese patrón.
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}
