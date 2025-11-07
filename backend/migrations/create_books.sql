create table if not exists books (
   id     text primary key,
   title  text not null,
   author text not null
);