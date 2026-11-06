# Eclipse Vault Coursework Demo

Интерактивен локален browser prototype за университетската курсова работа. Това не е real-money casino product: всички стойности са demo credits, няма login, deposits, wallet, payment processing или реални награди.

## Стартиране

От главната папка на проекта изпълни:

```powershell
uv run python -m http.server 8000 --bind 127.0.0.1
```

След това отвори в браузър:

```text
http://127.0.0.1:8000/eclipse-vault-demo/
```

## Публикуване през GitHub Pages

Папката `eclipse-vault-demo` е подготвена като root на GitHub repository. След като repository бъде създаден и файловете бъдат качени:

1. Отвори repository в GitHub.
2. Избери **Settings** → **Pages**.
3. В **Build and deployment** избери **Deploy from a branch**.
4. Избери branch `main` и папка `/(root)`, след което натисни **Save**.
5. GitHub ще покаже публичен адрес от типа `https://<username>.github.io/<repository-name>/`.

Файлът `.nojekyll` е добавен, за да се сервира static website пакетът директно. За създаване и качване през GitHub от този workspace е нужен свързан GitHub account или локално инсталиран Git.

## Алтернативно споделяне с други хора

Папката `eclipse-vault-demo` е самостоятелен static website package: съдържа `index.html`, CSS, JavaScript и всички нужни visual assets. Готовият файл `../Eclipse_Vault_Demo_Public.zip` може да се качи в Netlify Drop, за да се получи публичен HTTPS линк. Не качвай `127.0.0.1` адрес - той е достъпен само от твоя компютър.

## Какво демонстрира

- 5 reels × 3 rows и 20 fixed paylines;
- reel strips, paytable, Wild, Scatter, Free Spins, retrigger и multiplier, съгласувани с `eclipse_vault_math_model.py`;
- lobby, game screen, responsive controls, paytable/rules и project-presentation mode;
- визуалните assets от `assets/eclipse_vault/`;
- изрично разграничение между demo UI и production provider/operator services.

## Ограничения

Локалният JavaScript използва browser RNG само за визуална демонстрация. При production implementation outcome generation, balance, transaction settlement, KYC и Responsible Gaming ограниченията трябва да останат server-side и под контрола на лицензирания оператор и B2B provider архитектурата, описана в курсовата работа.
