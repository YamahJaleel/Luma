require "json"

package = JSON.parse(File.read(File.join(__dir__, "screen-protection-package.json")))

Pod::Spec.new do |s|
  s.name         = "ScreenProtection"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  Screen protection module for React Native apps.
                  Provides platform-specific screen protection functionality.
                  DESC
  s.homepage     = "https://github.com/luma-app/screen-protection"
  s.license      = "MIT"
  s.author       = { "Luma Team" => "team@luma.app" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/luma-app/screen-protection.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc = true

  s.dependency "React-Core"
end
