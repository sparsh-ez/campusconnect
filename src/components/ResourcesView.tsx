import React from 'react';
import { 
  ExternalLink, 
  FileText 
} from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const resourceCategories = [
    {
      title: 'Event Organization Guidelines',
      description: 'Official templates, venue booking rules, and administrative approval workflows for student clubs.',
      items: [
        {
          name: 'GCET Campus Auditorium Booking Protocol',
          type: 'PDF Document',
          size: '1.2 MB',
          url: 'https://gcet.edu.in',
          category: 'Administrative'
        },
        {
          name: 'Student Club Event Poster & Branding Kit',
          type: 'Design Template',
          size: '18.4 MB',
          url: 'https://canva.com',
          category: 'Marketing'
        },
        {
          name: 'Budget Approval & Sponsorship Proposal Template',
          type: 'DOCX Template',
          size: '420 KB',
          url: 'https://gcet.edu.in',
          category: 'Finance'
        }
      ]
    },
    {
      title: 'Registration & Ticketing Tools',
      description: 'Recommended platforms and guides for creating student registration forms and tracking attendance.',
      items: [
        {
          name: 'Google Forms Event Registration Standard Template',
          type: 'Form Template',
          size: 'Web App',
          url: 'https://forms.google.com',
          category: 'Registration'
        },
        {
          name: 'Unstop Hackathon & Competition Hosting Guide',
          type: 'Platform Guide',
          size: 'Online Guide',
          url: 'https://unstop.com',
          category: 'Competition'
        }
      ]
    },
    {
      title: 'Useful Campus Links',
      description: 'Direct portals for official college notifications, faculty approvals, and tech societies.',
      items: [
        {
          name: 'GCET Official College Portal',
          type: 'Portal',
          size: 'Live Portal',
          url: 'https://gcet.edu.in',
          category: 'Official'
        },
        {
          name: 'GCET Student Council & IIC Notice Board',
          type: 'Notice Board',
          size: 'Live Feed',
          url: 'https://gcet.edu.in',
          category: 'Student Body'
        },
        {
          name: 'TinyFish Autonomous Web Agent Documentation',
          type: 'Developer API',
          size: 'Docs',
          url: 'https://tinyfish.ai',
          category: 'AI Engine'
        }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
          Campus Resources & Materials
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginTop: '4px' }}>
          Essential documents, event registration kits, and campus guidelines for club leads and students.
        </p>
      </div>

      {/* Grid of Resource Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {resourceCategories.map((cat, idx) => (
          <div key={idx} className="card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{cat.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
                {cat.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cat.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-purple)'
                    }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#ffffff' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {item.type} • {item.size} • <span style={{ color: 'var(--primary-purple)' }}>{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: '12.5px', padding: '6px 14px', textDecoration: 'none' }}
                  >
                    <span>Open Resource</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
