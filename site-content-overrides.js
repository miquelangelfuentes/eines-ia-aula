function applyLateContentCorrections(){
  const heading=(selector,start)=>[...document.querySelectorAll(selector)].find(el=>el.textContent.trim().startsWith(start));

  const pagesHeading=heading('h2','Una comparativa des de la pràctica');
  const pagesBox=pagesHeading?.closest('.content-box');
  if(pagesBox){
    [...pagesBox.querySelectorAll('td')].forEach(td=>{
      const text=td.textContent.trim();
      if(text.includes('El lloc web només viu dins de l’entorn de Google')||text.includes("El lloc web només viu dins de l'entorn de Google")){
        td.innerHTML='<span class="badge-feature badge-negative">Integració amb Google Workspace</span><br>El lloc s’integra bé amb Drive i altres serveis de Google. No ofereix, però, una exportació directa del projecte com un conjunt de fitxers HTML, CSS i JavaScript per continuar-lo en una altra plataforma.';
      }
    });
    [...pagesBox.querySelectorAll('.card-item')].forEach(card=>{
      const title=card.querySelector('h3')?.textContent.trim();
      const p=card.querySelector('p');
      if(title==='Feu servir Google Sites quan...'&&p)p.textContent='Necessiteu un lloc informatiu fàcil d’editar, voleu treballar de manera col·laborativa amb l’equip docent o integreu sovint documents de Google Workspace.';
      if(title==='Feu servir GitHub Pages amb IA quan...'&&p)p.textContent='Necessiteu una activitat amb comportament interactiu personalitzat o voleu conservar el projecte com a fitxers web que pugueu revisar, reutilitzar i compartir.';
    });
  }

  const localHeading=heading('h2','1. Què és la intel·ligència artificial local');
  const localBox=localHeading?.closest('.content-box');
  if(localBox){
    [...localBox.querySelectorAll('.card-item')].forEach(card=>{
      const title=card.querySelector('h3');
      if(title?.textContent.trim()==='Més control sobre les dades'){
        const p=card.querySelector('p');
        if(p)p.textContent='Si el model i la interfície funcionen íntegrament en local, el centre pot reduir l’exposició de dades a proveïdors externs. Això no implica automàticament el compliment de l’RGPD: cal continuar revisant la finalitat del tractament i les mesures de protecció aplicables.';
      }
    });
  }
}