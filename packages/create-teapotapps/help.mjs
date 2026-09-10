export default async function () {
    console.log(`
                         .
                          \`:.
                            \`:.
                    .:'     ,::
                   .:'      ;:'
                   ::      ;:'
                    :    .:'
                     \`.  :.
            _________________________
           : _ _ _ _ _ _ _ _ _ _ _ _ :
       ,---:".".".".".".".".".".".".":
      : ,'"\`::.:.:.:.:.:.:.:.:.:.:.::'
      \`.\`.  \`:-===-===-===-===-===-:'
        \`.\`-._:                   :
          \`-.__\`.               ,'
      ,--------\`"\`-------------'--------.
       \`"--.__                   __.--"\`
              \`""-------------""'
  
      🫖 TeapotApps: slowly steeped, quickly served.

      🫖 TeapotApps CLI Help

    Usage:
      teapotapps create <project-name>   Create a new TeapotApp project
      teapotapps dev                     Start the development server
      teapotapps brew controller <name>  Scaffold a new controller
      teapotapps brew model <name>       Scaffold a new Sequelize model
      teapotapps brew middleware <name>  Scaffold a new middleware
      teapotapps brew api <name>         Scaffold controller + model + route
      teapotapps generate <KEY>          Generate a secret for a specific key in .env
      teapotapps generate ALL            Create or update .env with default values
      teapotapps help                    Show this help message
      teapotapps --version, -v           Show version info

    Happy brewing Tea! ☕
  `);
}
