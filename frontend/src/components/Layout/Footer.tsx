import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="footer">
      <div className="container cc-footer">
        <div className="footer-column cc-footer">
          <NavLink to="/" aria-current="page" className="navigation-logo w-inline-block">
            <img
              src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/69256ce47b7ba6ed1ec52836_Logo%20no%20background%20(white%20edt).png"
              width={155}
              alt=""
            />
          </NavLink>
          <div className="text-footer-credits">© 2024 Sfever Ag, All rights reserved.</div>
        </div>

        <div className="footer-column">
          <div className="footer-links-list">
            <NavLink to="/features" className="link-footer">
              Features
            </NavLink>
            <NavLink to="/pricing" className="link-footer">
              Pricing
            </NavLink>
            <NavLink to="/privacyterms" className="link-footer">
              Refund Policy
            </NavLink>
          </div>

          <div className="footer-links-list">
            <NavLink to="/about" className="link-footer">
              About
            </NavLink>
            <NavLink to="/contact" className="link-footer">
              Contact
            </NavLink>
            <NavLink to="/privacyterms" className="link-footer">
              Terms &amp; Conditions
            </NavLink>
            <NavLink to="/privacyterms" className="link-footer">
              Privacy Policy
            </NavLink>
          </div>

          <div className="footer-social">
            <a href="#" className="link-social w-inline-block">
              <img
                src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/6924575e25f2c55da5fad0bc_icon-facebook.svg"
                alt=""
              />
            </a>
            <a href="#" className="link-social w-inline-block">
              <img
                src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/6924575e25f2c55da5fad0bb_icon-twitter.svg"
                alt=""
              />
            </a>
            <a href="#" className="link-social w-inline-block">
              <img
                src="https://cdn.prod.website-files.com/6924575d25f2c55da5fad02c/6924575e25f2c55da5fad0ba_icon-instagram.svg"
                alt=""
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
