## Các bước chạy dự án

- Cài vendor
npm i        (frontend)
composer i   (backend)

- Cài thư viện lucide-react (frontend)
npm install lucide-react

- Cài thư viện toastify (frontend)
npm install react-toastify

- Cài thư viện react-select (frontend)
npm install react-select

- Cài thư viện lịch
npm install react-datepicker date-fns (frontend)

- Copy .env và sửa lại DB   (backend)
WINDOW:           copy .env.example .env
LINUX | UBUNTU:   cp .env.example .env

- GENERATE KEY   (backend)
php artisan key:generate

- MIGRATE & SEED   (backend)
php artisan migrate --seed

- SERVE
npm run dev         (frontend)
php artisan serve   (backend)
