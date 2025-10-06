PACKAGE_MANAGER := $(shell \
	if [ -f yarn.lock ]; then echo yarn; \
	elif [ -f pnpm-lock.yaml ]; then echo pnpm; \
	else echo npm; fi \
)

IS_EXPO := $(shell grep -q '"expo"' package.json && echo true || echo false)
IS_NEXT := $(shell grep -q '"next"' package.json && echo true || echo false)
IS_REACT := $(shell grep -Eq '"react-scripts"|"vite"' package.json && echo true || echo false)

info:
	@echo "Using package manager: $(PACKAGE_MANAGER)"
	@echo "Expo project: $(IS_EXPO)"
	@echo "Next.js project: $(IS_NEXT)"
	@echo "React project: $(IS_REACT)"

dev:
ifeq ($(IS_EXPO),true)
	@echo "Starting Expo dev server..."
	$(PACKAGE_MANAGER) run start
else ifeq ($(IS_NEXT),true)
	@echo "Starting Next.js dev server..."
	$(PACKAGE_MANAGER) run dev
else ifeq ($(IS_REACT),true)
	@echo "Starting React app dev server..."
	$(PACKAGE_MANAGER) run dev || $(PACKAGE_MANAGER) start
else
	@echo "Unknown project type (not Expo, Next.js or React)"
endif

build:
ifeq ($(IS_EXPO),true)
	@echo "Expo build not defined here (handled by EAS CLI or Expo CLI)"
else ifeq ($(IS_NEXT),true)
	@echo "Building Next.js app..."
	$(PACKAGE_MANAGER) run build
else ifeq ($(IS_REACT),true)
	@echo "Building React app..."
	$(PACKAGE_MANAGER) run build
else
	@echo "Unknown project type"
endif

lint:
	$(PACKAGE_MANAGER) run lint

android:
ifeq ($(IS_EXPO),true)
	$(PACKAGE_MANAGER) run android
else
	@echo "Android target only available for Expo projects"
endif

ios:
ifeq ($(IS_EXPO),true)
	$(PACKAGE_MANAGER) run ios
else
	@echo "iOS target only available for Expo projects"
endif

web:
ifeq ($(IS_EXPO),true)
	$(PACKAGE_MANAGER) run web
else ifeq ($(IS_NEXT),true)
	$(PACKAGE_MANAGER) run dev
else ifeq ($(IS_REACT),true)
	$(PACKAGE_MANAGER) run dev || $(PACKAGE_MANAGER) start
else
	@echo "Web target only available for Expo, Next.js or React projects"
endif

clean:
	@echo "Cleaning build artifacts..."
	rm -rf .expo .expo-shared .next dist build ios/build android/app/build

install:
	$(PACKAGE_MANAGER) install
