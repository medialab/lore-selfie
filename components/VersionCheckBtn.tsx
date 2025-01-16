import { useEffect, useMemo, useState } from "react";
import {version} from '~/package.json';
import { getBrowser } from "~helpers";

function VersionCheckBtn() {

  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  useEffect(() => {
    fetch(`https://raw.githubusercontent.com/medialab/lore-selfie/refs/heads/prod/package.json`)
    .then(response => {
      if (response.ok) {
        response.json()
        .then(prodPackage => {
          const {version: prodVersion} = prodPackage;
          if (version !== prodVersion) {
            setUpdateAvailable(true);
          }
        })
      }
    })
  });

  const {name: browser} = useMemo(() => getBrowser(), []) 

  if (updateAvailable) {
    return (
      <a className="btn VersionCheckBtn" href={browser === 'firefox' ? "https://medialab.github.io/lore-selfie/#installation" : 'https://itero.plasmo.com/ext/ocpebaoomdhdodepljbjjoblnnagglem'} target="blank" rel="noopener">
        nouvelle version disponible
      </a>
    )
  }

  return null;
}

export default VersionCheckBtn;