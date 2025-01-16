function About() {
  return (
    <div className="contents-wrapper About">
      <div className="contents width-limited-contents">
        <section>
          <h2>Présentation</h2>
          <p>
            Qu'apprendriez-vous sur vous-même si vous pouviez explorer
            l'auto-portrait que font les traces laissées par votre activité en
            ligne sur les plateformes de vidéo connectée ?
          </p>
          <p>
            <a
              href="https://medialab.github.io/lore-selfie/"
              rel="noopener"
              target="blank">
              Lore selfie
            </a>{" "}
            est une extension de navigateur expérimentale développée sous
            licence libre dans un contexte de recherche au{" "}
            <a href="https://medialab.sciencespo.fr/" target="blank">
              médialab de Sciences Po
            </a>{" "}
            pour explorer les formes contemporaines de culture associée à la
            fréquentation des contenus vidéos en ligne sur les réseaux sociaux.
          </p>
          <p>
            L'application vous permet d'enregistrer votre activité sur des
            plateformes telles que youtube et twitch puis de l'explorer sous la
            forme de visualisations et de petits documents à imprimer et
            annoter.
          </p>
          <p>
            Elle est associée à un projet de recherche plus général, intitulé
            <i>Politiques du lore</i>, mais peut également être utilisée de
            manière complètement autonome.
          </p>
          <p>
            <strong>
              Aucune donnée collectée par l'extension lore selfie ne quitte
              votre ordinateur
            </strong>
            . Ces données sont directement stockées sur votre disque dur et
            restent avant tout des données destinées à votre usage personnel.
          </p>
          <p>
            L'outil permet tout de même également d'exporter les données sous
            une forme plus ou moins filtrée et annotée (aux formats csv et json)
            afin de les partager ou de les réutiliser avec d'autres outils
            d'analyse ou de visualisation.
          </p>
        </section>
        <section>
          <h2>Conseils d'utilisation</h2>
          <div className="warning">
            <p>
              L'extension étant encore en développement, il est vivement
              conseillé de télécharger régulièrement une sauvegarde des données
              constituées avec le plugin. Pour ce faire :
            </p>
            <ul>
              <li>
                Ouvrez l'extension en cliquant sur son icône dans la liste des
                plugins (petit bonhomme violet)
              </li>
              <li>Cliquez sur le bouton "sauvegarder les données"</li>
              <li>
                Télécharger le fichier proposé - il est conseillé de conserver
                la partie du nom de fichier indiquant la date et l'heure du
                téléchargement !
              </li>
            </ul>
          </div>
        </section>
        <section>
          <h2>Questions essentielles</h2>
          <div>
            <div>
              <h3>Comment ouvrir l'extension ?</h3>
              <p>
                Pour savoir où trouver l'extension et comment l'ouvrir,
                reportez-vous si nécessaire à la documentation de votre
                navigateur :
              </p>
              <ul>
                <li>
                  <a
                    href="https://support.mozilla.org/fr/kb/extensions-unifie"
                    target="blank">
                    sur firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.google.com/chrome_webstore/answer/2664769"
                    target="blank">
                    sur chrome
                  </a>
                </li>
              </ul>
              <p>Puis :</p>
              <ol>
                <li>
                  Ouvrez l'extension en cliquant sur son icône dans la liste des
                  plugins (petit bonhomme violet)
                </li>
                <li>Cliquez sur "ouvrir l'application"</li>
              </ol>
            </div>
            <div>
              <h3>
                Comment restaurer une sauvegarde antérieure des données de
                l'extension ?
              </h3>
              <ol>
                <li>
                  Ouvrez l'extension en cliquant sur son icône dans la liste des
                  plugins (petit bonhomme violet)
                </li>
                <li>Cliquez sur "ouvrir le dashboard de développement"</li>
                <li>Cliquez sur "charger les données"</li>
                <li>
                  Sélectionner le fichier de sauvegarde précédemment constitué
                </li>
              </ol>
            </div>
            <div>
              <h3>Comment exporter mon carnet en PDF ?</h3>
              <ol>
                <li>
                  Ouvrez l'extension en cliquant sur son icône dans la liste des
                  plugins (petit bonhomme violet)
                </li>
                <li>Cliquez sur "ouvrir l'application"</li>
                <li>
                  Rendez-vous dans la page "exporter" et régler les paramètres
                  temporels, les paramètres de visibilité et d'anonymisation
                  ainsi que le format du carnet à votre guise
                </li>
                <li>
                  Cliquez sur "imprimer" en haut à droite, puis dans la liste
                  des imprimantes, sélectionnez "imprimer en PDF"
                </li>
                <li>
                  Lancez l'impression virtuelle et définissez le chemin et nom
                  du fichier de destination
                </li>
              </ol>
            </div>
            <div>
              <h3>À quoi servent les onglets de l'icône "organiser" ?</h3>
              <ol>
                <li>
                  l'onglet "Chaînes" permet de regrouper ensemble les
                  différentes chaînes d'un même créateur de contenu, afin
                  qu'elles apparaissent sous un même nom dans les vues Explorer
                  et Exporter
                </li>
                <li>
                  l'onglet "Étiquettes" permet de regrouper les chaînes - il
                  n'est pour l'instant pas utilisé dans les vues, mais bien
                  présent dans les données !
                </li>
                <li>
                  l'onglet "Expressions" permet d'enregistrer différents
                  éléments de langage présents dans les titres et dans les
                  messages de chat enregistrés - il n'est pour l'instant pas
                  utilisé dans les vues, mais bien présent dans les données !
                </li>
              </ol>
            </div>
          </div>
        </section>
        <section>
          <h2>Contacts</h2>
          <p>
            Pour toute question, prise de contact ou signalement de problème :
          </p>
          <ul>
            <li>
              Si vous utilisez la plateforme github, vous pouvez créer une{" "}
              <i>issue</i> sur le{" "}
              <a
                href="https://github.com/medialab/lore-selfie/issues/new"
                target="blank">
                répertoire du projet
              </a>
            </li>
            <li>
              Si vous êtes impliqué-e dans le lore workshop, vous pouvez
              contacter Robin directement via discord
            </li>
            <li>
              Sinon, merci de nous écrire à :{" "}
              <a href="mailto:lore-selfie-admins@googlegroups.com">
                lore-selfie-admins@googlegroups.com
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
export default About
