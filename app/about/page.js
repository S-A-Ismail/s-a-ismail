export const metadata = {
  title: 'About',
}

const certifications = [
  {
    name: 'AWS Certified Solutions Architect – Associate',
    url: 'https://www.credly.com/badges/d278ee4c-68a2-4212-b834-d0ae23aa17b6/linked_in_profile',
    img: '/assets/img/creds/aws-certified-solutions-architect-associate.png',
  },
  {
    name: 'Deep Learning Specialization',
    url: 'https://www.credly.com/badges/4e1d3152-64b7-417c-9b03-fccf13d2e90c/public_url',
    img: '/assets/img/creds/deep-learning-specialization.png',
  },
  {
    name: 'Databricks Certified Data Engineer Associate',
    url: 'https://credentials.databricks.com/d48a52e7-cbf2-455a-8604-fd502c4237c4#gs.6gorof',
    img: '/assets/img/creds/databricksdataengineer.png',
  },
  {
    name: 'Databricks Academy Accreditation – Platform Administrator',
    url: 'https://www.credential.net/7a6d7635-0971-443a-befa-e0fd377e4d3f#gs.6gorph',
    img: null,
  },
  {
    name: 'Databricks Academy Accreditation – AWS Databricks Platform Architect',
    url: 'https://www.credential.net/a82cee57-c505-4920-82fc-79a06124397d#gs.6goroq',
    img: null,
  },
]

export default function AboutPage() {
  return (
    <div className="post-content">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">About</h1>

      <p>
        I work as a Data Analytics Consultant at Systems Limited, a top IT services company in
        Pakistan. I hold a Bachelor&apos;s degree in Mechanical Engineering from Ghulam Ishaq Khan
        Institute of Engineering Sciences and Technology, one of the country&apos;s leading
        engineering institutes.
      </p>

      <p>
        In my role as a Data Platform Engineer, I specialize in creating, setting up, and managing
        modern, cloud-based data solutions. I use various tools like Databricks, AWS, Python, Spark,
        Docker, Kubernetes, and Terraform. I&apos;ve earned certifications in deep learning, data
        engineering, and lakehouse fundamentals from platforms like Coursera and Databricks.
      </p>

      <p>
        As a team leader, I&apos;ve managed a group of 10 platform operations professionals, ensuring
        smooth day-to-day operations and leading short-term projects to improve our platform.
        I&apos;ve tackled challenging projects, including moving from Hortonworks to AWS EMR, setting
        up the Unity Catalog and Platform Observability, and deploying a third-party tool called Aily
        Labs.
      </p>

      <p>
        I&apos;ve played a key role in creating Standard Operating Procedures (SOPs) for implementing
        the Databricks platform across 12 workspaces and 8 business units.
      </p>

      <p>
        I&apos;m passionate about data and cloud technologies and enjoy sharing my insights on my
        Medium blog. You can also find updates on my projects on my GitHub account. I&apos;m always
        eager to learn new skills and collaborate with fellow data and DevOps professionals.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-6">Licenses &amp; Certifications</h2>

      {/* Badge images */}
      <div className="flex flex-wrap gap-4 mb-6 not-prose">
        {certifications
          .filter(c => c.img)
          .map(cert => (
            <a
              key={cert.name}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              title={cert.name}
            >
              <img
                src={cert.img}
                alt={cert.name}
                className="w-[100px] h-[100px] object-contain hover:scale-105 transition-transform"
              />
            </a>
          ))}
      </div>

      {/* Full certification list */}
      <ul>
        {certifications.map(cert => (
          <li key={cert.name}>
            <a href={cert.url} target="_blank" rel="noopener noreferrer">
              {cert.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
