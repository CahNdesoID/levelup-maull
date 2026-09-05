/**
 * Global typography and base resets.
 *
 * Text selection is disabled app-wide to make the page feel less like a
 * document, but note bodies and previews opt back in via `.selectable` so the
 * user can still copy their own writing.
 */
export const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { font-family:'Plus Jakarta Sans',sans-serif; box-sizing:border-box; margin:0; padding:0;
        -webkit-user-select:none; user-select:none; -webkit-touch-callout:none; }
    input, textarea, .selectable { -webkit-user-select:text; user-select:text; }
    .fd { font-family:'Bricolage Grotesque',sans-serif; }
    ::-webkit-scrollbar { width:0; }
    input, textarea { font-family:'Plus Jakarta Sans',sans-serif; }
    @keyframes flyIn {
      from { opacity:0; transform:scale(0.88) translateY(20px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
    .fly-in { animation: flyIn .26s cubic-bezier(.34,1.56,.64,1) forwards; }
  `}</style>
);
