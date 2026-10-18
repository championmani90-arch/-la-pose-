import React from 'react';

export const AdBanner: React.FC = () => {
  const iframeContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : 'b290bba2060a584aeba75c21e9db81cf',
      'format' : 'iframe',
      'height' : 90,
      'width' : 728,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://bicea.org/22/b290bba2060a584aeba75c21e9db81cf"></script>
</body>
</html>`;

  return (
    <div className="w-full flex flex-col items-center justify-center my-6">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1.5">
        Espace Partenaire
      </span>
      <div className="w-full max-w-full overflow-x-auto flex justify-center rounded-xl bg-slate-900/60 border border-slate-800/80 p-2 shadow-inner">
        <iframe
          title="Bannière Partenaire"
          srcDoc={iframeContent}
          width="728"
          height="90"
          className="border-0 rounded-lg max-w-none"
          scrolling="no"
          loading="lazy"
        />
      </div>
    </div>
  );
};
