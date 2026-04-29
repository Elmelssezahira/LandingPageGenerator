export default function (editor, categories) {
    editor.BlockManager.add('form-salesforce-core', {
        label: 'Formulaire SF Core (Snippets)',
        category: categories.ESSENTIAL,
        content: `
            <section class="form-core-section">
                <!-- INJECTION DU SNIPPET SFMC POUR LE TRAITEMENT DU FORMULAIRE -->
                <div class="sfmc-snippet-logic" id="i7g8au">
                    <script runat="server">
                    Platform.Load("core","1.1.1");

                    /* ══════════════════════════════════════════════════════════════
                       CONFIGURATION SALESFORCE CORE  —  à adapter
                       ══════════════════════════════════════════════════════════════ */
                    var SF_BASE_URL      = process.env.SF_BASE_URL;
                    var SF_CLIENT_ID     = process.env.SF_CLIENT_ID;
                    var SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;

                    /* ── Traitement uniquement si le formulaire est soumis ──────── */
                    var submitted = Platform.Request.GetFormField("submitted");

                    if (submitted == "true") {

                      var firstName = Platform.Request.GetFormField("FirstName");
                      var lastName  = Platform.Request.GetFormField("LastName");
                      var email     = Platform.Request.GetFormField("EmailAddress");
                      var school    = Platform.Request.GetFormField("SchoolId");

                      try {

                        /* ── 1. OAuth2 Client Credentials → Access Token ──────── */
                        var tokenReq = new Script.Util.HttpRequest(
                          SF_BASE_URL + "/services/oauth2/token"
                        );
                        tokenReq.method               = "POST";
                        tokenReq.contentType          = "application/x-www-form-urlencoded";
                        tokenReq.emptyContentHandling = 0;
                        tokenReq.postData =
                          "grant_type=client_credentials" +
                          "&client_id="     + SF_CLIENT_ID +
                          "&client_secret=" + SF_CLIENT_SECRET;

                        var tokenRes  = tokenReq.send();
                        var tokenJSON = Platform.Function.ParseJSON(String(tokenRes.content));

                        if (tokenJSON.error) {
                          throw "Auth failed: " + tokenJSON.error_description;
                        }

                        var accessToken = tokenJSON.access_token;
                        var instanceUrl = tokenJSON.instance_url;

                        /* ── 2. Création du Contact dans SF Core ──────────────── */
                        var payload = Platform.Function.Stringify({
                          "FirstName" : firstName,
                          "LastName"  : lastName,
                          "Email"     : email,
                          "School__c" : school
                        });

                        var contactReq = new Script.Util.HttpRequest(
                          instanceUrl + "/services/data/v60.0/sobjects/Contact/"
                        );
                        contactReq.method               = "POST";
                        contactReq.contentType          = "application/json";
                        contactReq.emptyContentHandling = 0;
                        contactReq.setHeader("Authorization", "Bearer " + accessToken);
                        contactReq.postData = payload;

                        var contactRes  = contactReq.send();
                        var contactJSON = Platform.Function.ParseJSON(String(contactRes.content));

                        /* ── 3. Résultat ──────────────────────────────────────── */
                        if (contactJSON.success == true) {
                          Variable.SetValue("@sfStatus",    "success");
                          Variable.SetValue("@sfContactId", contactJSON.id);
                        } else {
                          var apiErr = (contactJSON[0] && contactJSON[0].message)
                            ? contactJSON[0].message
                            : "Erreur API Salesforce";
                          throw apiErr;
                        }

                      } catch (e) {
                        Variable.SetValue("@sfStatus",   "error");
                        Variable.SetValue("@sfErrorMsg", e.message ? e.message : String(e));
                      }
                    }
                    </script>
                </div>
                <div class="form-core-container">
                    <div class="form-header-premium">
                        <div class="sf-logo-badge"><i class="fab fa-salesforce"></i></div>
                        <h3 class="form-title">Contact CRM</h3>
                        <p class="form-subtitle">Formulaire intelligent Salesforce Core</p>
                    </div>
                    <!-- INJECTION DU SNIPPET SFMC POUR LES MESSAGES DE RETOUR -->
                   <div class="sfmc-snippet-messages" id="ipkr0e">
                        %%[
                        /* Removed the invalid SET = v() lines. 
                        The variables are already populated by SSJS */
                        IF @sfStatus == "success" OR @sfStatus == "error" THEN
                        ]%%
                        <style>
                            /* Rend le conteneur des messages visible */
                            #ipkr0e {
                                display: block !important;
                            }
                            .sfmc-msg {
                                display: flex;
                                align-items: flex-start;
                                gap: 12px;
                                padding: 16px 20px;
                                border-radius: 10px;
                                font-family: Outfit, sans-serif;
                                font-size: 14px;
                                line-height: 1.5;
                                margin-bottom: 20px;
                            }
                            .sfmc-msg i {
                                font-size: 20px;
                                flex-shrink: 0;
                                margin-top: 2px;
                            }
                            .sfmc-msg--success {
                                background-color: #ecfdf5;
                                color: #065f46;
                                border: 1px solid #6ee7b7;
                            }
                            .sfmc-msg--success i {
                                color: #059669;
                            }
                            .sfmc-msg--error {
                                background-color: #fef2f2;
                                color: #991b1b;
                                border: 1px solid #fca5a5;
                            }
                            .sfmc-msg--error i {
                                color: #dc2626;
                            }
                        </style>

                        %%[ IF @sfStatus == "success" THEN ]%%
                        
                        <style>
                            /* Masque le formulaire en cas de succès */
                            #ibbb9b, .sf-core-form-wrapper { 
                                display: none !important; 
                            }
                        </style>
                        
                        <div class="sfmc-msg sfmc-msg--success">
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <strong>Merci pour votre inscription !</strong><br />
                                Votre demande a bien été transmise à notre équipe. Nous vous contacterons prochainement pour confirmer votre visite.
                            </div>
                        </div>

                        %%[ ELSEIF @sfStatus == "error" THEN ]%%

                        <div class="sfmc-msg sfmc-msg--error">
                            <i class="fas fa-exclamation-circle"></i>
                            <div>
                                <strong>Une erreur est survenue</strong><br />
                                Nous n'avons pas pu traiter votre demande. (%%=v(@sfErrorMsg)=%%)
                            </div>
                        </div>

                        %%[ ENDIF ]%%
                        %%[ ENDIF ]%%
                    </div>
                    <form method="POST" action="%%=RequestParameter('PAGEURL')=%%" class="sf-core-form"><input
                            type="hidden" name="submitted" value="true" />
                        <div class="form-group-core"><label>École souhaitée</label><select name="SchoolId" required
                                class="form-select-core">
                                <option value="">Choisir une école...</option>
                                <!-- VALEURS STATIQUES POUR L'APERÇU DU BUILDER -->
                                <option value="efap">EFAP</option>
                                <option value="brassart">BRASSART</option>
                                <option value="icart">ICART</option>
                                <!-- INJECTION DU SNIPPET POUR LA PICKLIST DYNAMIQUE SFMC -->
                                <script runat="server">
                                Platform.Load("core","1.1.1");

                                /* ════════════════════════════════════════════════════════════
                                   CONFIGURATION SALESFORCE CORE  —  identique au Snippet 1
                                   ════════════════════════════════════════════════════════════ */
                                var SF_BASE_URL       = process.env.SF_BASE_URL;
                                var SF_CLIENT_ID      = process.env.SF_CLIENT_ID;
                                var SF_CLIENT_SECRET  = process.env.SF_CLIENT_SECRET;
                                var SF_RECORD_TYPE_ID = process.env.SF_RECORD_TYPE_ID; /* RecordTypeId du type Contact */

                                try {

                                  /* ── 1. OAuth2 Client Credentials → Access Token ──────── */
                                  var tokenReq = new Script.Util.HttpRequest(
                                    SF_BASE_URL + "/services/oauth2/token"
                                  );
                                  tokenReq.method               = "POST";
                                  tokenReq.contentType          = "application/x-www-form-urlencoded";
                                  tokenReq.emptyContentHandling = 0;
                                  tokenReq.postData =
                                    "grant_type=client_credentials" +
                                    "&client_id="     + SF_CLIENT_ID +
                                    "&client_secret=" + SF_CLIENT_SECRET;

                                  var tokenRes  = tokenReq.send();
                                  var tokenJSON = Platform.Function.ParseJSON(String(tokenRes.content));

                                  if (tokenJSON.error) throw tokenJSON.error_description;

                                  var accessToken = tokenJSON.access_token;
                                  var instanceUrl = tokenJSON.instance_url;

                                  /* ── 2. Récupération picklist School__c ───────────────── */
                                  var picklistUrl =
                                    instanceUrl +
                                    "/services/data/v60.0/ui-api/object-info/Contact/picklist-values/" +
                                    SF_RECORD_TYPE_ID +
                                    "/School__c";

                                  var picklistReq = new Script.Util.HttpRequest(picklistUrl);
                                  picklistReq.method               = "GET";
                                  picklistReq.emptyContentHandling = 0;
                                  picklistReq.setHeader("Authorization", "Bearer " + accessToken);

                                  var picklistRes  = picklistReq.send();
                                  var picklistJSON = Platform.Function.ParseJSON(String(picklistRes.content));

                                  /* ── 3. Génération dynamique des <option> ─────────────── */
                                  var values = picklistJSON.values;
                                  for (var i = 0; i < values.length; i++) {
                                    Write(
                                      '<option value="' + values[i].value + '">' +
                                        values[i].label +
                                      '</option>'
                                    );
                                  }

                                } catch (e) {
                                  /* Silencieux : les options statiques ci-dessus servent de fallback */
                                  Write('<!-- SF Core picklist indisponible : ' + (e.message || String(e)) + ' -->');
                                }
                                </script>
                            </select></div>
                        <div class="form-row">
                            <div class="form-group-core"><label>Nom</label><input type="text" name="LastName" required
                                    placeholder="Dupont" /></div>
                            <div class="form-group-core"><label>Prénom</label><input type="text" name="FirstName"
                                    required placeholder="Jean" /></div>
                        </div>
                        <div class="form-group-core"><label>Email</label><input type="email" name="EmailAddress"
                                required placeholder="jean@exemple.com" /></div><button type="submit"
                            class="form-core-submit"><span>Envoyer au CRM</span><i class="fas fa-database"></i></button>
                    </form>
                </div>
            </section>

            <style>
                .sfmc-snippet-logic, .sfmc-snippet-messages { display: none !important; }
                .form-core-section { padding: 60px 20px; background: #f1f5f9; font-family: 'Outfit', sans-serif; }
                .form-core-container { max-width: 480px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .sf-logo-badge { width: 40px; height: 40px; background: #00A1E0; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: white; font-size: 18px; }
                .form-header-premium { text-align: center; margin-bottom: 25px; }
                .form-title { font-size: 22px; font-weight: 800; color: #1e293b; margin: 0; }
                .form-subtitle { color: #64748b; font-size: 13px; margin-top: 5px; }
                .sf-core-form { display: flex; flex-direction: column; gap: 15px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .form-group-core { display: flex; flex-direction: column; gap: 5px; }
                .form-group-core label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; }
                .form-group-core input, .form-select-core { padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #f8fafc; }
                .form-core-submit { margin-top: 5px; background: #00A1E0; color: white; border: none; padding: 15px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
            </style>
        `,
        attributes: { class: 'gjs-fonts gjs-f-form' }
    });
}
