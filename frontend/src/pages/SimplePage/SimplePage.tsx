import NavBar from '../../components/Layout/NavBar';

export default function SimplePage({ title }: { title: string }) {
  return (
    <>
      <div className="header-inner">
        <NavBar />
        <div className="container">
          <div className="header-inner-content">
            <div className="inner-category">
              <a href="#" className="h3 cc-header">
                {title}
              </a>
              <div className="cta-line cc-header"></div>
            </div>
            <h1 className="h1">{title}</h1>
          </div>
        </div>
      </div>
    </>
  );
}
