create table article_report
(
  id          int unsigned auto_increment
    primary key,
  user_id     int(10)                             not null,
  article_id  int(10)                             not null,
  report_time timestamp default CURRENT_TIMESTAMP not null,
  reason      varchar(4096)                       not null,
  status      int default '0'                     null,
  constraint id_UNIQUE
  unique (id)
);

create table category
(
  id          int unsigned auto_increment
    primary key,
  subject     varchar(16) charset utf8   not null,
  description varchar(4096) charset utf8 not null,
  image       varchar(256)               null,
  constraint id_UNIQUE
  unique (id)
)

create table industry
(
  id          int unsigned auto_increment
    primary key,
  name        varchar(45) charset utf8  not null,
  description varchar(256) charset utf8 null,
  image       varchar(256) charset utf8 null,
  constraint id_UNIQUE
  unique (id)
)

create table user
(
  id            int unsigned auto_increment
    primary key,
  username      varchar(16) charset utf8                                          not null
  comment '用户名
限制:6-16,由数字、字母、_组成,必须有字母开头',
  avatar        varchar(256) charset utf8                                         null,
  password      varchar(16) charset utf8                                          null
  comment '密码\n限制:8-16,由数字、字母、_、!、@、#、*、?',
  nickname      varchar(16) charset utf8                                          not null
  comment '昵称
限制:2-16,由汉字、数字、字母、_组成',
  gender        enum ('secrecy', 'male', 'female') charset utf8 default 'secrecy' not null
  comment '性别
枚举
Secrecy:保密
Male:男
Female:女',
  birthday      date                                                              null,
  statement     varchar(256) charset utf8                                         null,
  email         varchar(45) charset utf8                                          not null
  comment '邮箱\n必须可用',
  register_at   timestamp default CURRENT_TIMESTAMP                               not null,
  last_login_at timestamp default CURRENT_TIMESTAMP                               not null,
  location      varchar(45) charset utf8                                          null,
  status        int default '0'                                                   not null,
  user_type     int default '0'                                                   not null,
  usable        tinyint default '1'                                               not null,
  constraint id_UNIQUE
  unique (id),
  constraint usercol_UNIQUE
  unique (username)
)

create table apply_add_category
(
  id           int unsigned auto_increment
    primary key,
  user_id      int unsigned                        not null,
  status       int unsigned default '0'            not null,
  deal_user_id int unsigned                        null,
  deal_time    timestamp                           null,
  subject      varchar(16) charset utf8            not null,
  description  varchar(4096)                       not null,
  image        varchar(256)                        null,
  apply_time   timestamp default CURRENT_TIMESTAMP not null,
  constraint id_UNIQUE
  unique (id),
  constraint apply_add_category_user
  foreign key (user_id) references user (id),
  constraint apply_add_category_deal_user
  foreign key (deal_user_id) references user (id)
);

create index apply_add_category_deal_user_idx
  on apply_add_category (deal_user_id);

create index apply_add_category_user_idx
  on apply_add_category (user_id);

create table apply_add_industry
(
  id           int unsigned auto_increment,
  user_id      int unsigned                        not null,
  apply_time   timestamp default CURRENT_TIMESTAMP null,
  deal_user_id int unsigned                        null,
  deal_time    timestamp                           null,
  name         varchar(16) charset utf8            not null,
  description  varchar(4096)                       null,
  image        varchar(256) charset utf8           null,
  status       int unsigned default '0'            not null,
  primary key (id, name),
  constraint id_UNIQUE
  unique (id),
  constraint apply_add_industry_user
  foreign key (user_id) references user (id),
  constraint apply_add_industry_deal_user
  foreign key (deal_user_id) references user (id)
);

create index apply_add_industry_deal_user_idx
  on apply_add_industry (deal_user_id);

create index apply_add_industry_idx
  on apply_add_industry (user_id);

create table apply_admin
(
  id           int unsigned auto_increment
    primary key,
  user_id      int unsigned                        not null,
  reason       varchar(256)                        not null,
  apply_time   timestamp default CURRENT_TIMESTAMP not null,
  status       int default '0'                     not null,
  deal_user_id int unsigned                        null,
  deal_time    timestamp                           null,
  constraint id_UNIQUE
  unique (id),
  constraint apply_admin_user
  foreign key (user_id) references user (id),
  constraint apply_admin_deal_user
  foreign key (deal_user_id) references user (id)
);

create index apply_admin_deal_user_idx
  on apply_admin (deal_user_id);

create index apply_admin_user_idx
  on apply_admin (user_id);

create table article
(
  id               int unsigned auto_increment
    primary key,
  title            varchar(45) charset utf8            not null,
  content          varchar(256) charset utf8           not null,
  release_time     timestamp default CURRENT_TIMESTAMP not null,
  last_modify_time timestamp default CURRENT_TIMESTAMP not null,
  user_id          int unsigned                        not null,
  abstract         varchar(256) charset utf8           not null,
  image            varchar(256)                        null,
  status           int default '0'                     null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_article_user
  foreign key (user_id) references user (id)
)

create index fk_article_user_idx
  on article (user_id);

create table article_category
(
  id          int unsigned auto_increment
    primary key,
  article_id  int unsigned not null,
  category_id int unsigned not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_article_category_article
  foreign key (article_id) references article (id),
  constraint fk_article_category_category
  foreign key (category_id) references category (id)
)

create index fk_article_category_article_idx
  on article_category (article_id);

create index fk_article_category_category_idx
  on article_category (category_id);

create table article_collected
(
  id          int unsigned auto_increment
    primary key,
  user_id     int unsigned                        not null,
  article_id  int unsigned                        not null,
  create_time timestamp default CURRENT_TIMESTAMP not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_article_collected_user
  foreign key (user_id) references user (id),
  constraint fk_article_collected_article
  foreign key (article_id) references article (id)


create index fk_article_collected_article_idx
  on article_collected (article_id);

create index fk_article_collected_user_idx
  on article_collected (user_id);

create table article_industry
(
  id          int unsigned auto_increment
    primary key,
  article_id  int unsigned not null,
  industry_id int unsigned not null,
  constraint id_UNIQUE
  unique (id),
  constraint article_industry_fk_article
  foreign key (article_id) references article (id),
  constraint article_industry_fk_industry
  foreign key (industry_id) references industry (id)
);

create index article_industry_fk_article_idx
  on article_industry (article_id);

create index article_industry_fk_industry_idx
  on article_industry (industry_id);

create table article_like
(
  id          int unsigned auto_increment
    primary key,
  user_id     int unsigned                        not null,
  article_id  int unsigned                        not null,
  create_time timestamp default CURRENT_TIMESTAMP not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_article_like_user
  foreign key (user_id) references user (id),
  constraint fk_article_like_article
  foreign key (article_id) references article (id)
)

create index fk_article_like_article_idx
  on article_like (article_id);

create index fk_article_like_user_idx
  on article_like (user_id);

create table comment
(
  id          int unsigned auto_increment
    primary key,
  content     varchar(256) charset utf8           not null,
  create_time timestamp default CURRENT_TIMESTAMP not null,
  user_id     int unsigned                        not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_comment_user
  foreign key (user_id) references user (id)
)

create table article_comment
(
  id         int unsigned auto_increment
    primary key,
  article_id int unsigned not null,
  comment_id int unsigned not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_article_comment_article
  foreign key (article_id) references article (id),
  constraint fk_article_comment_comment
  foreign key (comment_id) references comment (id)
)

create index fk_article_comment_article_idx
  on article_comment (article_id);

create index fk_article_comment_comment_idx
  on article_comment (comment_id);

create table com_comment
(
  id                   int unsigned auto_increment
    primary key,
  commented_comment_id int unsigned not null,
  comment_id           int unsigned not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_com_comment_commented
  foreign key (commented_comment_id) references comment (id),
  constraint fk_com_commnet_comment
  foreign key (comment_id) references comment (id)
)

create index fk_com_comment_commented_idx
  on com_comment (commented_comment_id);

create index fk_com_commnet_comment_idx
  on com_comment (comment_id);

create index fk_comment_user_idx
  on comment (user_id);

create table comment_like
(
  id          int unsigned auto_increment
    primary key,
  user_id     int unsigned                        not null,
  comment_id  int unsigned                        not null,
  create_time timestamp default CURRENT_TIMESTAMP not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_comment_like_user
  foreign key (user_id) references user (id),
  constraint fk_comment_like_comment
  foreign key (comment_id) references comment (id)
)

create index fk_comment_like_comment_idx
  on comment_like (comment_id);

create index fk_comment_like_user_idx
  on comment_like (user_id);

create table edu_background
(
  id      int unsigned auto_increment
    primary key,
  school  varchar(45) charset utf8                                                    not null,
  degree  enum ('BACHELOR', 'MASTER', 'DOCTOR', 'OTHER') charset utf8 default 'OTHER' not null,
  major   varchar(32) charset utf8                                                    not null,
  user_id int unsigned                                                                not null,
  constraint id_UNIQUE
  unique (id),
  constraint edu_background_user
  foreign key (user_id) references user (id)
)

create index edu_background_user_idx
  on edu_background (user_id);

create table em_record
(
  id       int unsigned auto_increment
    primary key,
  company  varchar(45) charset utf8 not null
  comment '公司',
  position varchar(45) charset utf8 not null
  comment '职位',
  user_id  int unsigned             not null
  comment '关联用户索引',
  constraint id_UNIQUE
  unique (id),
  constraint fk_em_record_user
  foreign key (user_id) references user (id)
)

create index fk_em_record_user_idx
  on em_record (user_id);

create table message
(
  id        int unsigned auto_increment
    primary key,
  content   varchar(4096) charset utf8mb4       not null,
  s_user_id int unsigned                        not null,
  a_user_id int unsigned                        not null,
  send_time timestamp default CURRENT_TIMESTAMP not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_message_send_user
  foreign key (s_user_id) references user (id),
  constraint fk_message_accept_user
  foreign key (a_user_id) references user (id)
)

create index fk_message_accept_user_idx
  on message (a_user_id);

create index fk_message_send_user_idx
  on message (s_user_id);

create table project_link
(
  link       varchar(128) charset utf8 not null,
  article_id int unsigned              not null,
  constraint fk_project_link_article
  foreign key (article_id) references article (id)
)

create index fk_project_link_article_idx
  on project_link (article_id);

create table sec_question
(
  id       int unsigned default '0' not null
    primary key,
  question varchar(45) charset utf8 not null,
  answer   varchar(45) charset utf8 not null,
  user_id  int unsigned             not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_sec_question_user
  foreign key (user_id) references user (id)
)

create index fk_sec_question_user_idx
  on sec_question (user_id);

create table user_category
(
  id          int unsigned auto_increment
    primary key,
  user_id     int unsigned not null,
  category_id int unsigned not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_user_category_user
  foreign key (user_id) references user (id),
  constraint fk_user_category_category
  foreign key (category_id) references category (id)
)

create index fk_user_category_category_idx
  on user_category (category_id);

create index fk_user_category_user_idx
  on user_category (user_id);

create table user_concerned
(
  id                int unsigned auto_increment
    primary key,
  user_id           int unsigned not null,
  concerned_user_id int unsigned not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_user_concerned_user
  foreign key (user_id) references user (id),
  constraint fk_user_concerned_concerned_user
  foreign key (concerned_user_id) references user (id)
)

create index fk_user_concerned_concerned_user_idx
  on user_concerned (concerned_user_id);

create index fk_user_concerned_user_idx
  on user_concerned (user_id);

create table user_industry
(
  id          int unsigned auto_increment
    primary key,
  user_id     int unsigned not null,
  industry_id int unsigned not null,
  constraint id_UNIQUE
  unique (id),
  constraint fk_user_industry_user
  foreign key (user_id) references user (id),
  constraint fk_user_industry_industry
  foreign key (industry_id) references industry (id)
)

create index fk_user_industry_industry_idx
  on user_industry (industry_id);

create index fk_user_industry_user_idx
  on user_industry (user_id);

create table user_report
(
  id             int unsigned auto_increment
    primary key,
  user_id        int unsigned                        not null,
  report_user_id int unsigned                        not null,
  report_time    timestamp default CURRENT_TIMESTAMP not null,
  reason         varchar(4096)                       not null,
  status         int default '0'                     null,
  constraint id_UNIQUE
  unique (id)
);

