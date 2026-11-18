import { Link } from 'react-router-dom';
import { t, useLanguage } from '../i18n';

const LAST_UPDATED = '18 November 2026';
// Contact address for privacy questions and report-deletion requests.
const CONTACT_EMAIL = 'nuunabu@gmail.com';

export default function Privacy() {
  useLanguage();
  return (
    <main style={styles.main}>
      <article style={styles.container}>
        <h1 style={styles.h1}>{t('Privacy Policy and Terms of Use')}</h1>
        <p style={styles.meta}>{t('Last updated:')} {LAST_UPDATED}</p>

        <p style={styles.p}>
          Nuru is a student research prototype developed at the African Leadership University. It helps people
          considering voluntary return to Burundi find information and see where it came from. This page explains,
          in plain language, what Nuru collects, how it is used, and the rules for using the service.
        </p>

        <h2 style={styles.h2}>1. What Nuru collects</h2>
        <h3 style={styles.h3}>When you browse</h3>
        <p style={styles.p}>
          You do not need an account to read information. Nuru does not use cookies, analytics, advertising or
          tracking tools, and it does not ask for your name, phone number, email address, refugee ID or plans to return.
        </p>
        <h3 style={styles.h3}>When you report a problem</h3>
        <p style={styles.p}>
          A report stores only the entry you reported, the reason you chose (outdated, incorrect, incomplete or other),
          an optional comment, and the date and time. Nuru does not ask who you are. Please do not write your name,
          phone number or other personal details in the comment.
        </p>
        <h3 style={styles.h3}>On your own device</h3>
        <p style={styles.p}>
          Your language choice and your saved articles are stored only in your browser. They are never sent to Nuru's
          server. You can remove them at any time by clearing this website's data in your browser settings.
        </p>
        <h3 style={styles.h3}>Staff accounts</h3>
        <p style={styles.p}>
          Only authorised administrators have accounts. Their passwords are stored in hashed form, never as plain text,
          and their sign-in token is kept in their own browser.
        </p>
        <h3 style={styles.h3}>Hosting providers</h3>
        <p style={styles.p}>
          The website is hosted by Vercel and the server and database by Render. Like most hosting providers, they may
          record technical information such as IP addresses in their service logs. Nuru does not use these logs to
          identify people. These servers may be located outside Rwanda.
        </p>

        <h2 style={styles.h2}>2. How reports are used</h2>
        <p style={styles.p}>
          Reports are used only to check and correct information. Only administrators can read them. When a report is
          resolved, Nuru records the outcome, which administrator resolved it, and when. Reports are never sold or
          shared for any other purpose.
        </p>

        <h2 style={styles.h2}>3. Your choices</h2>
        <p style={styles.p}>
          You can use Nuru without giving any personal information. Reporting a problem is optional. If you sent a
          report and want it deleted, contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={styles.a}>{CONTACT_EMAIL}</a> with
          the entry title and the date you sent it, because Nuru does not know who sent each report.
        </p>

        <h2 style={styles.h2}>4. Terms of use</h2>
        <h3 style={styles.h3}>Information, not advice</h3>
        <p style={styles.p}>
          Each entry summarises a published source. "Source checked" means an administrator confirmed that the entry
          matches its cited source on the date shown. It does not mean that conditions are still the same, or that a
          place is safe for you. Nuru does not recommend whether to return and does not give legal, medical or protection
          advice. For advice about your own situation, contact UNHCR or another organisation you trust.
        </p>
        <h3 style={styles.h3}>Use the service responsibly</h3>
        <p style={styles.p}>
          Do not submit false reports, personal information about yourself or others, or harmful content.
        </p>
        <h3 style={styles.h3}>Ownership</h3>
        <p style={styles.p}>
          Each entry links to its original source, which remains the property of its publisher. Nuru's own source code
          is published under the MIT License.
        </p>
        <h3 style={styles.h3}>A research prototype</h3>
        <p style={styles.p}>
          Nuru is provided as it is. It may contain errors or outdated information, and it may sometimes be unavailable.
        </p>

        <h2 style={styles.h2}>5. Changes and contact</h2>
        <p style={styles.p}>
          If this page changes, the date at the top will be updated. Questions about privacy can be sent
          to <a href={`mailto:${CONTACT_EMAIL}`} style={styles.a}>{CONTACT_EMAIL}</a>.
        </p>

        <p style={styles.p}><Link to="/" style={styles.a}>{t('← Back to Home')}</Link></p>
      </article>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { backgroundColor: '#f8faf9', minHeight: '80vh' },
  container: { maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem 3rem', color: '#1e293b' },
  h1: { fontSize: '1.6rem', color: '#1a3c2e', marginBottom: '0.25rem' },
  meta: { color: '#475569', fontSize: '0.9rem', marginTop: 0 },
  h2: { fontSize: '1.2rem', color: '#1a3c2e', marginTop: '2rem', marginBottom: '0.5rem' },
  h3: { fontSize: '1rem', color: '#1e293b', marginTop: '1.25rem', marginBottom: '0.25rem' },
  p: { lineHeight: 1.7, margin: '0.5rem 0' },
  a: { color: '#1a5f8f', fontWeight: 600 },
};
