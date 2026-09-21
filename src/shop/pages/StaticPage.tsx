import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, Page } from '../../services/api';
import { t } from '../../i18n';

/** Statik sahifa (biz haqimizda, aloqa...): admin CKEditor'dan HTML. */
export const StaticPage: React.FC = () => {
  const { slug = '' } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => { setPage(null); api.page(slug).then(setPage).catch(() => setMissing(true)); }, [slug]);
  if (missing) return <div className="text-slate-500">404</div>;
  if (!page) return <div className="text-slate-500 text-sm">{t('Yuklanmoqda...')}</div>;
  return (
    <article className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-black text-slate-900">{page.title}</h1>
      <div className="prose prose-p:text-slate-600 prose-a:text-primary-600 max-w-none text-slate-600 [&_p]:mb-3 [&_a]:text-primary-600 [&_strong]:text-slate-900" dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
};
