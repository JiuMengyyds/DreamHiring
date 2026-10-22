USE dream_hiring;

ALTER TABLE sys_user
    ADD COLUMN avatar_object_key VARCHAR(255) NULL AFTER avatar_url;

ALTER TABLE company
    ADD COLUMN logo_object_key VARCHAR(255) NULL AFTER logo_url;

-- 旧字段可能保存过期签名 URL，只迁移看起来像对象键的历史值。
UPDATE sys_user
SET avatar_object_key = avatar_url
WHERE avatar_object_key IS NULL
  AND avatar_url IS NOT NULL
  AND avatar_url NOT LIKE 'http%'
  AND avatar_url NOT LIKE '/%';

UPDATE company
SET logo_object_key = logo_url
WHERE logo_object_key IS NULL
  AND logo_url IS NOT NULL
  AND logo_url NOT LIKE 'http%'
  AND logo_url NOT LIKE '/%';
